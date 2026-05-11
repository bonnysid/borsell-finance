import { restService } from '@shared/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CHAT_SESSIONS_KEY } from './useGetChatSessions';

export const useDeleteChatSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      await restService.DELETE(`/assistant/sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_SESSIONS_KEY });
    },
  });
};
