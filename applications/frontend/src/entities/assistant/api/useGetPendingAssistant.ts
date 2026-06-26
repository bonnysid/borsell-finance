import { restService } from '@shared/api';
import { AssistantPendingShape } from '@packages/types';
import { useQuery } from '@tanstack/react-query';

export const PENDING_ASSISTANT_KEY = ['assistant-pending'];

/**
 * Глобальный поллер незавершённых сообщений ассистента.
 * Нужен, чтобы показывать уведомление, когда ответ пришёл, а пользователь на другой странице.
 */
export const useGetPendingAssistant = (enabled = true) => {
  return useQuery({
    queryKey: PENDING_ASSISTANT_KEY,
    queryFn: async () => {
      const { data } = await restService.GET<AssistantPendingShape[]>('/assistant/pending');
      return data;
    },
    enabled,
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
  });
};
