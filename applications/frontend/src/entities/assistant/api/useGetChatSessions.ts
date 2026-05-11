import { restService } from '@shared/api';
import { ChatSessionShape } from '@packages/types';
import { useQuery } from '@tanstack/react-query';

export const CHAT_SESSIONS_KEY = ['chat-sessions'];

export const useGetChatSessions = () => {
  return useQuery({
    queryKey: CHAT_SESSIONS_KEY,
    queryFn: async () => {
      const { data } = await restService.GET<ChatSessionShape[]>('/assistant/sessions');
      return data;
    },
  });
};
