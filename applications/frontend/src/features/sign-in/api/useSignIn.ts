import { authApi, useIsAuth } from '@entities/auth';
import { AUTH_QUERY_KEYS } from '@shared/api';
import { useMutation } from '@tanstack/react-query';

export const useSignIn = () => {
  const { setIsAuth } = useIsAuth();

  return useMutation({
    mutationKey: AUTH_QUERY_KEYS.signIn(),
    mutationFn: authApi.signIn,
    onSuccess: () => {
      setIsAuth(true);
    },
  });
};
