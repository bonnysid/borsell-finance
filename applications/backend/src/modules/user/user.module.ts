import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SettingsModule } from '@/modules/settings';
import { UserController } from '@/modules/user/user.controller';
import { UserService } from '@/modules/user/user.service';

import { UserEntity } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), SettingsModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
