import { Injectable } from '@nestjs/common';
import Big from 'big.js';
import { addDays, differenceInDays } from 'date-fns';

import { formatDateToSqlDate, normalizeDate } from '@/common';
import { MoexAssetHistoryPrice, MoexColumnValue } from '@/modules/moex/moex.types';

@Injectable()
export class MoexMapperService {
  mapPrice(value?: MoexColumnValue, fallbackValue = 0) {
    return new Big(value ?? fallbackValue);
  }

  mapDate(value?: MoexColumnValue, fallbackValue = normalizeDate(new Date())) {
    if (!value) return fallbackValue;

    return normalizeDate(new Date(value));
  }

  mapString(value?: MoexColumnValue, fallbackValue = '') {
    return value ? String(value) : fallbackValue;
  }

  fillHistoryGaps(history: MoexAssetHistoryPrice[]): MoexAssetHistoryPrice[] {
    if (history.length === 0) return [];

    const result: MoexAssetHistoryPrice[] = [];
    const seenDates = new Set<string>();

    for (let i = 0; i < history.length; i++) {
      const current = history[i];
      const currentDate = formatDateToSqlDate(current.date);

      // Пропускаем дубликаты, оставляя последний (так как история обычно ASC)
      if (seenDates.has(currentDate)) {
        // Если дата уже была, заменяем последнее значение (для надежности, если MOEX отдал несколько цен за день)
        const lastIndex = result.findLastIndex((r) => formatDateToSqlDate(r.date) === currentDate);
        if (lastIndex !== -1) {
          result[lastIndex] = { ...current, date: new Date(currentDate) };
        }
        continue;
      }

      if (result.length > 0) {
        const prev = result[result.length - 1];
        const prevDate = formatDateToSqlDate(prev.date);

        const diffDays = differenceInDays(currentDate, prevDate);

        if (diffDays > 1) {
          for (let j = 1; j < diffDays; j++) {
            const missingDate = addDays(prevDate, j);
            result.push({
              symbol: prev.symbol,
              close: prev.close,
              open: prev.close,
              low: prev.close,
              high: prev.close,
              currencyCode: prev.currencyCode,
              date: missingDate,
              volume: new Big(0),
              isSynthesized: true,
            });
          }
        }
      }

      result.push({ ...current, date: new Date(currentDate) });
      seenDates.add(currentDate);
    }

    return result;
  }
}
