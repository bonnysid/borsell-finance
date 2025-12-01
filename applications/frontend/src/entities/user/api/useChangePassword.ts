import { ChangePasswordDtoShape, SuccessResponse } from '@packages/types';
import { restService } from '@shared/api';
import { useMutation } from '@tanstack/react-query';

const changePassword = async (dto: ChangePasswordDtoShape) => {
  const res = await restService.PATCH<SuccessResponse, ChangePasswordDtoShape>(
    'users/me/password',
    { data: dto },
  );

  return res.data;
};

export const useChangePassword = () => {
  return useMutation({
    mutationKey: ['change-password'],
    mutationFn: changePassword,
  });
};
