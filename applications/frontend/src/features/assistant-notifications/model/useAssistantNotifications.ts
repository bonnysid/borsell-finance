import { useGetPendingAssistant } from '@entities/assistant';
import { useNotifications } from '@shared/model';
import { AppRoutes } from '@shared/router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

type PendingInfo = { sessionId: string; sessionTitle: string };

/**
 * Глобально отслеживает незавершённые ответы ассистента и показывает уведомление,
 * когда ответ пришёл, а пользователь не смотрит на эту сессию.
 */
export const useAssistantNotifications = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const notify = useNotifications((s) => s.notify);
  const { data: pending } = useGetPendingAssistant();

  // Карта незавершённых сообщений с предыдущего опроса: messageId -> инфо о сессии.
  const prevPendingRef = useRef<Map<string, PendingInfo>>(new Map());

  // Актуальная локация в ref, чтобы не пересоздавать эффект и не пропускать опросы.
  const locationRef = useRef(location);
  locationRef.current = location;

  useEffect(() => {
    if (!pending) return;

    const current = new Map<string, PendingInfo>(
      pending.map((p) => [p.id, { sessionId: p.sessionId, sessionTitle: p.sessionTitle }]),
    );

    const prev = prevPendingRef.current;
    prevPendingRef.current = current;

    // Сообщения, которые были pending, а теперь исчезли из списка — значит, завершились.
    prev.forEach((info, messageId) => {
      if (current.has(messageId)) return;

      const activeSessionId = new URLSearchParams(locationRef.current.search).get('session');
      const isViewingSession =
        locationRef.current.pathname.startsWith(AppRoutes.ASSISTANT) &&
        activeSessionId === info.sessionId;

      if (isViewingSession) return;

      notify({
        title: t('assistant.notification.ready_title'),
        body: info.sessionTitle || t('assistant.notification.ready_body'),
        sessionId: info.sessionId,
      });
    });
  }, [pending, notify, t]);
};
