import { UserDtoShape } from '@packages/types';
import { restService } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

const getMe = async () => {
  const res = await restService.GET<UserDtoShape>('/users/me');

  return res.data;
};

export const useGetMe = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    enabled,
  });
};
