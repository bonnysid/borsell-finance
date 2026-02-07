import {
  Body,
  Controller,
  Get,
  Patch,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { AuthGuard, CurrentUser } from '@/common';
import { UserJWT } from '@/express';
import { ChangeCurrencyDto, ChangePasswordDto, UserDto } from '@/modules/user/dto';
import { UserService } from '@/modules/user/user.service';

@UseGuards(AuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@CurrentUser() user: UserJWT) {
    const dbUser = await this.userService.findOne(user.username);

    if (!dbUser) {
      throw new UnauthorizedException();
    }

    return new UserDto(dbUser);
  }

  @Patch('me/password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Res() res: Response,
    @CurrentUser() user: UserJWT,
  ) {
    await this.userService.changePassword(user.username, changePasswordDto);

    return res.status(200).json({ message: 'Password changed successfully' });
  }

  @Patch('me/currency')
  async changeCurrency(
    @CurrentUser() user: UserJWT,
    @Body() changeCurrencyDto: ChangeCurrencyDto,
    @Res() res: Response,
  ) {
    const savedUser = await this.userService.changeCurrency(user.username, changeCurrencyDto);

    return res.status(200).json(new UserDto(savedUser));
  }
}
