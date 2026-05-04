import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { MoexSeederService } from './moex-seeder.service';

@Injectable()
export class MoexSchedulerService {
  private readonly logger = new Logger(MoexSchedulerService.name);

  constructor(private readonly moexSeederService: MoexSeederService) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMoexSeed() {
    this.logger.log('Starting scheduled MOEX seeding...');
    try {
      await this.moexSeederService.seed();
      this.logger.log('MOEX seeding completed successfully.');
    } catch (error) {
      this.logger.error('Failed to seed MOEX data.', error.stack);
    }
  }
}
