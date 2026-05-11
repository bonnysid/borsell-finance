import { restService } from '@shared/api';
import { useMutation } from '@tanstack/react-query';

export const useAskAssistant = () => {
  return useMutation({
    mutationFn: async (question: string) => {
      const { data } = await restService.POST<{ response: string }, { question: string }>(
        '/assistant/ask',
        { data: { question }, timeout: 0 },
      );
      return data.response;
    },
  });
};
