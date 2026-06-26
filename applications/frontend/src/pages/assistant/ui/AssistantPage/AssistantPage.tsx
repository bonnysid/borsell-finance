import { Button, bindStyles } from '@devbonnysid/ui-kit-default';
import {
  useAskAssistant,
  useDeleteChatSession,
  useGetAssistantDigest,
  useGetChatMessages,
  useGetChatSessions,
  useGetPendingAssistant,
} from '@entities/assistant';

import { TypingIndicator } from './TypingIndicator';
import { ChatMessageShape } from '@packages/types';
import { FC, FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import styles from './AssistantPage.module.scss';

const cn = bindStyles(styles);

export const AssistantPage: FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSessionId = searchParams.get('session');
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: sessions = [] } = useGetChatSessions();
  const { data: remoteMessages } = useGetChatMessages(activeSessionId);
  const { data: pending } = useGetPendingAssistant();
  const askAssistant = useAskAssistant();
  const getDigest = useGetAssistantDigest();
  const deleteSession = useDeleteChatSession();

  // Сессии, по которым прямо сейчас генерируется ответ — для индикатора в списке чатов.
  const pendingSessionIds = useMemo(
    () => new Set((pending ?? []).map((p) => p.sessionId)),
    [pending],
  );

  // AI «думает», пока среди сообщений есть pending, либо пока летит запрос на регистрацию.
  const hasPending = !!remoteMessages?.some((m) => m.status === 'pending');
  const isBusy = hasPending || askAssistant.isPending || getDigest.isPending;

  const QUICK_PROMPTS = useMemo(
    () => [
      t('assistant.prompts.improve'),
      t('assistant.prompts.risks'),
      t('assistant.prompts.rebalance'),
    ],
    [t],
  );

  const greeting: ChatMessageShape = useMemo(
    () => ({
      id: 'greeting',
      sessionId: '',
      role: 'assistant',
      content: t('assistant.greeting'),
      status: 'done',
      createdAt: '',
    }),
    [t],
  );

  const messages: ChatMessageShape[] = useMemo(() => {
    if (activeSessionId && remoteMessages && remoteMessages.length > 0) {
      return remoteMessages;
    }
    if (!activeSessionId) {
      return [greeting];
    }
    return [];
  }, [activeSessionId, remoteMessages, greeting]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const setActiveSession = (sessionId: string | null) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (sessionId) {
          next.set('session', sessionId);
        } else {
          next.delete('session');
        }
        return next;
      },
      { replace: true },
    );
  };

  const startNewChat = () => {
    setActiveSession(null);
    textareaRef.current?.focus();
  };

  const selectSession = (sessionId: string) => {
    if (sessionId === activeSessionId) return;
    setActiveSession(sessionId);
  };

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    await deleteSession.mutateAsync(sessionId);
    if (activeSessionId === sessionId) startNewChat();
  };

  const sendMessage = async (question: string) => {
    const text = question.trim();
    if (!text || isBusy) return;

    setInputValue('');
    try {
      const result = await askAssistant.mutateAsync({
        question: text,
        sessionId: activeSessionId ?? undefined,
      });
      if (result.sessionId !== activeSessionId) setActiveSession(result.sessionId);
    } catch {
      // ошибка регистрации запроса — статус не изменится, пользователь может повторить
    }
  };

  const handleDigest = async () => {
    if (isBusy) return;
    try {
      const result = await getDigest.mutateAsync(activeSessionId ?? undefined);
      if (result.sessionId !== activeSessionId) setActiveSession(result.sessionId);
    } catch {
      // см. комментарий выше
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const fmtMsgTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' });
  };

  return (
    <div className={cn('page')}>
      {/* Sidebar */}
      <aside className={cn('sidebar')}>
        <div className={cn('sidebar-head')}>
          <Button type="button" onClick={startNewChat} isFullWidth>
            + {t('assistant.new_chat')}
          </Button>
        </div>
        <div className={cn('session-list')}>
          {sessions.map((s) => (
            <div
              key={s.id}
              className={cn('session-item', { active: s.id === activeSessionId })}
              onClick={() => selectSession(s.id)}
            >
              <div className={cn('session-title')}>{s.title}</div>
              <div className={cn('session-meta')}>
                {pendingSessionIds.has(s.id) ? (
                  <span className={cn('session-generating')}>
                    <span className={cn('session-dot')} />
                    {t('assistant.generating')}
                  </span>
                ) : (
                  <span>{fmtDate(s.updatedAt)}</span>
                )}
                <button
                  type="button"
                  className={cn('session-del')}
                  onClick={(e) => handleDelete(e, s.id)}
                  title={t('assistant.delete_chat')}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat */}
      <div className={cn('chat')}>
        <div className={cn('chat-header')}>
          <div>
            <h1>{t('assistant.page_title')}</h1>
            <p>{t('assistant.page_description')}</p>
          </div>
        </div>

        <div className={cn('messages')}>
          {messages.map((msg) => (
            <div key={msg.id} className={cn('msg', msg.role)}>
              {msg.status === 'pending' ? (
                <TypingIndicator />
              ) : (
                <>
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                  {msg.createdAt && (
                    <span className={cn('msg-time')}>{fmtMsgTime(msg.createdAt)}</span>
                  )}
                </>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className={cn('bottom')}>
          <div className={cn('quick-prompts')}>
            <button
              type="button"
              className={cn('digest-btn')}
              onClick={handleDigest}
              disabled={isBusy}
            >
              ✨ {t('assistant.get_digest')}
            </button>
            {QUICK_PROMPTS.map((p) => (
              <button key={p} type="button" disabled={isBusy} onClick={() => sendMessage(p)}>
                {p}
              </button>
            ))}
          </div>

          <form className={cn('form')} onSubmit={handleSubmit}>
            <div className={cn('textarea-wrap')}>
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('assistant.placeholder')}
                rows={2}
                disabled={isBusy}
              />
            </div>
            <Button type="submit" disabled={!inputValue.trim() || isBusy}>
              {t('assistant.send')}
            </Button>
          </form>
          <span className={cn('hint')}>{t('assistant.enter_hint')}</span>
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;
