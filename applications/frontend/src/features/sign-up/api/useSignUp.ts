import { authApi, useIsAuth } from '@entities/auth';
import { AUTH_QUERY_KEYS } from '@shared/api';
import { useMutation } from '@tanstack/react-query';

export const useSignUp = () => {
  const { setIsAuth } = useIsAuth();

  return useMutation({
    mutationKey: AUTH_QUERY_KEYS.signUp(),
    mutationFn: authApi.signUp,
    onSuccess: () => {
      setIsAuth(true);
    },
  });
};
