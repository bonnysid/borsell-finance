import { SignInDtoShape, SignUpDtoShape, SuccessResponse } from '@packages/types';
import { restService } from '@shared/api';

export class AuthApi {
  logout = async () => {
    const res = await restService.POST<SuccessResponse, void>('/auth/logout');

    return res.data;
  };

  refreshToken = async () => {
    const res = await restService.POST<SuccessResponse, void>('/auth/refresh');

    return res.data;
  };

  signIn = async (dto: SignInDtoShape) => {
    const res = await restService.POST<SuccessResponse, SignInDtoShape>('/auth/sign-in', {
      data: dto,
    });

    return res.data;
  };

  signUp = async (dto: SignUpDtoShape) => {
    const res = await restService.POST<SuccessResponse, SignUpDtoShape>('/auth/sign-up', {
      data: dto,
    });

    return res.data;
  };
}

export const authApi = new AuthApi();
