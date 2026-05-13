import { restService } from '@shared/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CHAT_SESSIONS_KEY } from './useGetChatSessions';

type DigestPayload = { sessionId?: string };
type DigestResponse = { response: string; sessionId: string };

export const useGetAssistantDigest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId?: string) => {
      const { data } = await restService.POST<DigestResponse, DigestPayload>(
        '/assistant/digest',
        { data: { sessionId }, timeout: 0 },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_SESSIONS_KEY });
    },
  });
};
