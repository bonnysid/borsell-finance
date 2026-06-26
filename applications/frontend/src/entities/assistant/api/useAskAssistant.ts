import { restService } from '@shared/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CHAT_SESSIONS_KEY } from './useGetChatSessions';
import { chatMessagesKey } from './useGetChatMessages';

type AskPayload = { question: string; sessionId?: string };
type AskResponse = { sessionId: string; messageId: string };

export const useAskAssistant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AskPayload) => {
      const { data } = await restService.POST<AskResponse, AskPayload>('/assistant/ask', {
        data: payload,
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CHAT_SESSIONS_KEY });
      queryClient.invalidateQueries({ queryKey: chatMessagesKey(data.sessionId) });
    },
  });
};
