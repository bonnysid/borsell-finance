import { Button, bindStyles } from '@devbonnysid/ui-kit-default';
import { useAskAssistant, useGetAssistantDigest } from '@entities/assistant';
import { PortfolioInsight, usePortfolioInsights } from '@widgets/portfolio-insight';
import { FC, FormEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './AssistantPage.module.scss';

type AssistantMessage = {
  id: string;
  author: 'user' | 'assistant';
  text: string;
};

const cn = bindStyles(styles);

export const AssistantPage: FC = () => {
  const { t } = useTranslation();
  const insight = usePortfolioInsights();
  const [message, setMessage] = useState('');
  const [answers, setAnswers] = useState<AssistantMessage[]>([]);

  const askAssistant = useAskAssistant();
  const getDigest = useGetAssistantDigest();

  const QUICK_PROMPTS = useMemo(
    () => [
      t('assistant.prompts.improve'),
      t('assistant.prompts.risks'),
      t('assistant.prompts.rebalance'),
    ],
    [t],
  );

  const initialAnswer = useMemo(() => {
    if (!insight.hasData) {
      return t('assistant.no_data_yet');
    }

    return `${insight.title}. ${insight.summary}: ${insight.recommendations[0]}`;
  }, [insight, t]);

  const sendQuestion = async (question: string) => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) return;

    const userMessageId = `${Date.now()}-user`;
    const assistantMessageId = `${Date.now()}-assistant`;

    setAnswers((prev) => [
      {
        id: userMessageId,
        author: 'user',
        text: `${t('assistant.you')}: ${trimmedQuestion}`,
      },
      ...prev,
    ]);

    setMessage('');

    try {
      const response = await askAssistant.mutateAsync(trimmedQuestion);

      setAnswers((prev) => [
        {
          id: assistantMessageId,
          author: 'assistant',
          text: `${t('assistant.assistant')}: ${response}`,
        },
        ...prev,
      ]);
    } catch (error) {
      setAnswers((prev) => [
        {
          id: assistantMessageId,
          author: 'assistant',
          text: `${t('assistant.assistant')}: ${t('assistant.error') || 'Ошибка при получении ответа'}`,
        },
        ...prev,
      ]);
    }
  };

  const handleGetDigest = async () => {
    const assistantMessageId = `${Date.now()}-assistant`;

    setAnswers((prev) => [
      {
        id: assistantMessageId,
        author: 'assistant',
        text: `${t('assistant.assistant')}: ${t('assistant.loading_digest') || 'Загружаю сводку новостей...'}`,
      },
      ...prev,
    ]);

    try {
      const response = await getDigest.mutateAsync();

      setAnswers((prev) => [
        {
          id: assistantMessageId,
          author: 'assistant',
          text: `${t('assistant.assistant')}: ${response}`,
        },
        ...prev.filter((a) => a.id !== assistantMessageId),
      ]);
    } catch (error) {
      setAnswers((prev) => [
        {
          id: assistantMessageId,
          author: 'assistant',
          text: `${t('assistant.assistant')}: ${t('assistant.error_digest') || 'Не удалось получить сводку новостей.'}`,
        },
        ...prev.filter((a) => a.id !== assistantMessageId),
      ]);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendQuestion(message);
  };

  return (
    <div className={cn('assistant-page')}>
      <div className={cn('content')}>
        <PortfolioInsight />

        <div className={cn('assistant-card')}>
          <div className={cn('assistant-header')}>
            <div>
              <h1>{t('assistant.page_title')}</h1>
              <p>{t('assistant.page_description')}</p>
            </div>
          </div>

          <div className={cn('message', 'assistant')}>{initialAnswer}</div>

          <div className={cn('quick-prompts')}>
            <button
              key="digest"
              type="button"
              onClick={handleGetDigest}
              className={cn('digest-btn')}
            >
              ✨ {t('assistant.get_digest') || 'Сводка новостей'}
            </button>
            {QUICK_PROMPTS.map((prompt) => (
              <button key={prompt} type="button" onClick={() => sendQuestion(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <div className={cn('answers')}>
            {answers.map((answer) => (
              <div key={answer.id} className={cn('message', answer.author)}>
                {answer.text}
              </div>
            ))}
          </div>

          <form className={cn('form')} onSubmit={handleSubmit}>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={t('assistant.placeholder')}
              rows={3}
            />
            <Button type="submit" disabled={!message.trim()}>
              {t('assistant.send')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;
