import { restService } from '@shared/api';
import { useMutation } from '@tanstack/react-query';

export const useGetAssistantDigest = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await restService.POST<{ response: string }>('/assistant/digest');
      return data.response;
    },
  });
};
