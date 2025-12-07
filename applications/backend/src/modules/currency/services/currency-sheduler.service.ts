import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { CurrencyService } from './currency.service';

@Injectable()
export class CurrencySchedulerService {
  private readonly logger = new Logger(CurrencySchedulerService.name);

  constructor(private readonly currencyService: CurrencyService) {}

  // 1. Обновление курсов валют
  // Запускается каждые 30 минут. Это обеспечивает актуальность rateToBase.
  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleCurrencyUpdate() {
    this.logger.log('Starting scheduled currency rate update...');
    try {
      await this.currencyService.fetchAndUpdateAllRates();
      this.logger.log('Currency rates updated successfully.');
    } catch (error) {
      this.logger.error('Failed to update currency rates.', error.stack);
    }
  }
}
