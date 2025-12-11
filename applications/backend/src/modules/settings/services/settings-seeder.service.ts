// src/seeds/settings.seeder.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { SettingKey } from '@/modules/settings/entities';

import { SettingsService } from './settings.service';

@Injectable()
export class SettingsSeederService implements OnModuleInit {
  private readonly logger = new Logger(SettingsSeederService.name);

  constructor(private readonly settingsService: SettingsService) {}

  async onModuleInit() {
    await this.seedBaseCurrency();
  }

  private async seedBaseCurrency() {
    const defaultCode = 'USD';

    this.logger.log(`Seeding ${SettingKey.BASE_CURRENCY_CODE}...`);

    try {
      const existing = await this.settingsService.getBaseCurrencyCode();

      this.logger.log(`${SettingKey.BASE_CURRENCY_CODE} already set to "${existing}", skipping`);
      return;
    } catch {
      this.logger.log(`${SettingKey.BASE_CURRENCY_CODE} not found, creating...`);
    }

    await this.settingsService.setRaw(
      SettingKey.BASE_CURRENCY_CODE,
      defaultCode,
      'Default currency code for all currencies.',
    );

    this.logger.log(`${SettingKey.BASE_CURRENCY_CODE} set to "${defaultCode}" successfully`);
  }
}
