import { useIsAuth } from '@entities/auth';
import { SuccessResponse } from '@packages/types';
import { restService } from '@shared/api';
import { useMutation } from '@tanstack/react-query';

const logout = async () => {
  const res = await restService.POST<SuccessResponse, void>('/auth/logout');

  return res.data;
};

export const useLogout = () => {
  const { setIsAuth } = useIsAuth();

  return useMutation({
    mutationKey: ['logout'],
    mutationFn: logout,
    onSuccess: () => {
      setIsAuth(false);
    },
  });
};
