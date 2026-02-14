import { authApi, useIsAuth } from '@entities/auth';
import { AUTH_QUERY_KEYS } from '@shared/api';
import { useMutation } from '@tanstack/react-query';

export const useLogout = () => {
  const { setIsAuth } = useIsAuth();

  return useMutation({
    mutationKey: AUTH_QUERY_KEYS.logout(),
    mutationFn: authApi.logout,
    onSuccess: () => {
      setIsAuth(false);
    },
  });
};
