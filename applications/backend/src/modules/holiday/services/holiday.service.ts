import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

import { formatDateToSqlDate } from '@/common/utils/date.utils';

import { HolidayEntity } from '../entities';

@Injectable()
export class HolidayService {
  private readonly logger = new Logger(HolidayService.name);

  constructor(
    @InjectRepository(HolidayEntity)
    private readonly holidayRepo: Repository<HolidayEntity>,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Проверяет, является ли день выходным или праздничным.
   * Если данных за этот год нет в БД, запрашивает их у isdayoff.ru и сохраняет.
   */
  async isDayOff(date: Date): Promise<boolean> {
    const year = date.getFullYear();
    const dateStr = formatDateToSqlDate(date);

    // 1. Ищем в БД
    const cached = await this.holidayRepo.findOne({
      where: { date: new Date(dateStr) },
    });

    if (cached) {
      return cached.isDayOff;
    }

    // 2. Если не нашли, загружаем весь год
    await this.fetchAndSaveYear(year);

    // 3. Ищем снова после сохранения
    const reFetched = await this.holidayRepo.findOne({
      where: { date: new Date(dateStr) },
    });

    if (reFetched) {
      return reFetched.isDayOff;
    }

    // 4. Fallback (если API недоступно или вернуло ошибку)
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  /**
   * Запрашивает данные за весь год и сохраняет в БД.
   */
  private async fetchAndSaveYear(year: number): Promise<void> {
    try {
      this.logger.log(`Fetching holidays for year ${year} from isdayoff.ru`);
      const url = `https://isdayoff.ru/api/getdata?year=${year}&cc=ru`;
      const response = await lastValueFrom(
        this.httpService.get<string>(url, { responseType: 'text' }),
      );

      const dataStr = String(response.data);

      this.logger.log(`Received ${dataStr.length} holidays for year ${year}, ${dataStr}`);

      if (dataStr && dataStr.length >= 365) {
        const days = dataStr.split('');
        const entities: HolidayEntity[] = [];

        // Создаем даты для всего года
        const startDate = new Date(year, 0, 1);
        for (let i = 0; i < days.length; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i);

          entities.push(
            this.holidayRepo.create({
              date: currentDate,
              isDayOff: days[i] === '1',
            }),
          );
        }

        if (entities.length > 0) {
          await this.holidayRepo.save(entities);
          this.logger.log(`Saved ${entities.length} holiday records for year ${year}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to fetch holidays for year ${year}`, error);
    }
  }
}
