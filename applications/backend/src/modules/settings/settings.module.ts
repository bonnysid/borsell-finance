import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SettingsEntity } from './entities';
import { SettingsSeederService, SettingsService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([SettingsEntity])],
  providers: [SettingsSeederService, SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
