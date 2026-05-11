import { restService } from '@shared/api';
import { ChatMessageShape } from '@packages/types';
import { useQuery } from '@tanstack/react-query';

export const chatMessagesKey = (sessionId: string) => ['chat-messages', sessionId];

export const useGetChatMessages = (sessionId: string | null) => {
  return useQuery({
    queryKey: chatMessagesKey(sessionId ?? ''),
    queryFn: async () => {
      const { data } = await restService.GET<ChatMessageShape[]>(
        `/assistant/sessions/${sessionId}/messages`,
      );
      return data;
    },
    enabled: !!sessionId,
  });
};
