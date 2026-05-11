import { restService } from '@shared/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CHAT_SESSIONS_KEY } from './useGetChatSessions';

type AskPayload = { question: string; sessionId?: string };
type AskResponse = { response: string; sessionId: string };

export const useAskAssistant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AskPayload) => {
      const { data } = await restService.POST<AskResponse, AskPayload>('/assistant/ask', {
        data: payload,
        timeout: 0,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_SESSIONS_KEY });
    },
  });
};
