import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SettingKey, SettingsEntity } from '../entities';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SettingsEntity)
    private readonly settingsRepo: Repository<SettingsEntity>,
  ) {}
  private readonly logger = new Logger(SettingsService.name);

  async getRaw(key: SettingKey): Promise<SettingsEntity | null> {
    const setting = await this.settingsRepo.findOne({ where: { key } });

    return setting;
  }

  async setRaw(key: SettingKey, value: string, description?: string): Promise<SettingsEntity> {
    let setting = await this.settingsRepo.findOne({ where: { key } });

    if (!setting) {
      setting = this.settingsRepo.create({
        key,
        value,
        description,
      });
    } else {
      setting.value = value;
      if (description !== undefined) {
        setting.description = description;
      }
    }

    return this.settingsRepo.save(setting);
  }

  async getString(key: SettingKey): Promise<string | null> {
    const raw = await this.getRaw(key);
    return raw?.value ?? null;
  }

  async getNumber(key: SettingKey): Promise<number> {
    const value = await this.getString(key);
    const num = Number(value);

    if (Number.isNaN(num)) {
      throw new BadRequestException(`Setting "${key}" value "${value}" is not a valid number`);
    }

    return num;
  }

  async getBoolean(key: SettingKey): Promise<boolean | null> {
    const value = (await this.getString(key))?.trim().toLowerCase();

    if (!value) return null;

    if (['true', '1', 'yes', 'y', 'on'].includes(value)) return true;
    if (['false', '0', 'no', 'n', 'off'].includes(value)) return false;

    throw new BadRequestException(`Setting "${key}" value "${value}" is not a valid boolean`);
  }

  async getJson<T = unknown>(key: SettingKey): Promise<T | null> {
    const value = await this.getString(key);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch (e) {
      throw new BadRequestException(
        `Setting "${key}" value is not valid JSON: ${(e as Error).message}`,
      );
    }
  }

  async getBaseCurrencyCode(): Promise<string> {
    const code = await this.getString(SettingKey.BASE_CURRENCY_CODE);

    return code ?? 'USD';
  }

  async setBaseCurrency(code: string): Promise<void> {
    await this.setRaw(
      SettingKey.BASE_CURRENCY_CODE,
      code,
      'Base currency code for portfolio valuation',
    );
  }
}
