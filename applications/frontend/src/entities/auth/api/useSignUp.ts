import { useIsAuth } from '@entities/auth';
import { SignUpDtoShape, SuccessResponse } from '@packages/types';
import { restService } from '@shared/api';
import { useMutation } from '@tanstack/react-query';

const signUp = async (dto: SignUpDtoShape) => {
  const res = await restService.POST<SuccessResponse, SignUpDtoShape>('/auth/sign-up', {
    data: dto,
  });

  return res.data;
};

export const useSignUp = () => {
  const { setIsAuth } = useIsAuth();

  return useMutation({
    mutationKey: ['sign-up'],
    mutationFn: signUp,
    onSuccess: () => {
      setIsAuth(true);
    },
  });
};
