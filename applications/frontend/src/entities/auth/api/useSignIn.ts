import { useIsAuth } from '@entities/auth';
import { SignInDtoShape, SuccessResponse } from '@packages/types';
import { restService } from '@shared/api';
import { useMutation } from '@tanstack/react-query';

const signIn = async (dto: SignInDtoShape) => {
  const res = await restService.POST<SuccessResponse, SignInDtoShape>('/auth/sign-in', {
    data: dto,
  });

  return res.data;
};

export const useSignIn = () => {
  const { setIsAuth } = useIsAuth();

  return useMutation({
    mutationKey: ['sign-in'],
    mutationFn: signIn,
    onSuccess: () => {
      setIsAuth(true);
    },
  });
};
