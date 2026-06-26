import { restService } from '@shared/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CHAT_SESSIONS_KEY } from './useGetChatSessions';
import { chatMessagesKey } from './useGetChatMessages';

type DigestPayload = { sessionId?: string };
type DigestResponse = { sessionId: string; messageId: string };

export const useGetAssistantDigest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId?: string) => {
      const { data } = await restService.POST<DigestResponse, DigestPayload>('/assistant/digest', {
        data: { sessionId },
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CHAT_SESSIONS_KEY });
      queryClient.invalidateQueries({ queryKey: chatMessagesKey(data.sessionId) });
    },
  });
};
