import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AppModule } from '../app.module';
import { AssetPriceHistoryEntity } from '../modules/asset/entities';
import { Logger } from '@nestjs/common';
import { normalizeDate } from '../common/utils/date.utils';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('RemoveDuplicatesScript');

  const historyRepo = app.get<Repository<AssetPriceHistoryEntity>>(
    getRepositoryToken(AssetPriceHistoryEntity),
  );

  logger.log('Starting duplicate removal process...');

  // Поиск групп дубликатов на один и тот же день (без учета времени)
  // Используем DATE(history.date) для нормализации в SQL запросе
  const duplicateGroups = await historyRepo
    .createQueryBuilder('history')
    .select('history.assetId', 'assetId')
    .addSelect('DATE(history.date)', 'calendarDate')
    .addSelect('history.timeframe', 'timeframe')
    .addSelect('COUNT(*)', 'count')
    .groupBy('history.assetId')
    .addGroupBy('DATE(history.date)')
    .addGroupBy('history.timeframe')
    .having('COUNT(*) > 1')
    .getRawMany();

  logger.log(`Found ${duplicateGroups.length} groups of calendar-day duplicates.`);

  let totalDeleted = 0;
  let totalNormalized = 0;

  for (const group of duplicateGroups) {
    const { assetId, calendarDate, timeframe } = group;

    // Ищем все записи для этого актива на этот календарный день
    // Используем BETWEEN или DATE(), чтобы найти записи с разным временем
    const history = await historyRepo.find({
      where: {
        asset: { id: assetId },
        timeframe: timeframe,
      },
      order: { date: 'ASC', updatedAt: 'DESC' },
    });

    // Фильтруем записи только на этот день на стороне JS, чтобы не писать сложный SQL
    const dailyRecords = history.filter((r) => {
      // r.date is already a Date object from TypeORM
      const calendarStr = r.date.toISOString().split('T')[0];
      return calendarStr === calendarDate;
    });

    if (dailyRecords.length > 1) {
      const bestRecord = dailyRecords[0];
      const others = dailyRecords.slice(1);

      // Удаляем лишние
      const idsToDelete = others.map((r) => r.id);
      await historyRepo.delete(idsToDelete);
      totalDeleted += idsToDelete.length;

      // Проверяем, нормализована ли дата у лучшей записи
      const originalDate = bestRecord.date;
      const normalizedDate = normalizeDate(originalDate);

      if (originalDate.getTime() !== normalizedDate.getTime()) {
        bestRecord.date = normalizedDate;
        await historyRepo.save(bestRecord);
        totalNormalized++;
      }

      logger.log(`Asset ${assetId}: Deleted ${idsToDelete.length} duplicates on ${calendarDate}. Keeping record ${bestRecord.id}.`);
    } else if (dailyRecords.length === 1) {
      // Даже если дублей нет, но время не 00:00:00 - нормализуем
      const record = dailyRecords[0];
      const originalDate = record.date;
      const normDate = normalizeDate(originalDate);

      if (originalDate.getTime() !== normDate.getTime()) {
        record.date = normDate;
        await historyRepo.save(record);
        totalNormalized++;
        logger.log(`Normalized date for single record ${record.id} on ${calendarDate}`);
      }
    }
  }

  // Вторая фаза: Пройти по ВСЕМ записям и нормализовать дату, если она не 00:00:00
  // Это поможет, если есть записи с разным временем, но они не являются "дублями" (по одной на день)
  logger.log('Starting global date normalization check...');
  const allHistory = await historyRepo.find();
  
  for (const record of allHistory) {
    const originalDate = record.date;
    const normDate = normalizeDate(originalDate);

    if (originalDate.getTime() !== normDate.getTime()) {
      record.date = normDate;
      await historyRepo.save(record);
      totalNormalized++;
    }
  }

  logger.log(`Cleanup finished.`);
  logger.log(`Total records deleted: ${totalDeleted}`);
  logger.log(`Total records normalized to 00:00:00: ${totalNormalized}`);

  await app.close();
}

bootstrap().catch((err) => {
  console.error('Error during duplicate removal:', err);
  process.exit(1);
});
