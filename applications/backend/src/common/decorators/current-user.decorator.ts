import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthorizedRequest, UserJWT } from '@/express';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): UserJWT => {
  const request: AuthorizedRequest = ctx.switchToHttp().getRequest();
  return request.user;
});
