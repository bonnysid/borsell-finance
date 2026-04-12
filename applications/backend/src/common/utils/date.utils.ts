import {
  differenceInDays,
  differenceInHours,
  format,
  isSameDay as isSameDayFns,
  isValid,
  startOfDay,
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

// Мы используем UTC для большинства операций с датами в базе данных
const DEFAULT_TIMEZONE = 'UTC';

/**
 * Преобразует дату в строку формата YYYY-MM-DD.
 * Полезно для сравнения дат без учета времени.
 */
export function formatDateToSqlDate(date?: Date | string | number): string {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  if (!isValid(dateObj)) return '';

  return format(dateObj, 'yyyy-MM-dd');
}

/**
 * Сбрасывает время даты до 00:00:00.000 в UTC часовом поясе.
 */
export function normalizeDate(date?: Date | string): Date {
  const dateObj = date ? (date instanceof Date ? date : new Date(date)) : new Date();

  if (!isValid(dateObj)) {
    return new Date(0);
  }

  // startOfDay в date-fns работает в локальном часовом поясе,
  // поэтому для UTC нам нужно либо использовать date-fns-tz, либо специфичный подход
  return toZonedTime(startOfDay(toZonedTime(dateObj, 'UTC')), 'UTC');
}

/**
 * Сравнивает две даты по календарному дню (год, месяц, день).
 */
export function isSameDay(date1: Date | string, date2?: Date | string): boolean {
  if (!date1 || !date2) return false;
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);

  if (!isValid(d1) || !isValid(d2)) return false;

  return isSameDayFns(d1, d2);
}

/**
 * Возвращает разницу в днях между двумя датами.
 */
export function getDaysDifference(date1: Date | string, date2: Date | string = new Date()): number {
  if (!date1 || !date2) return 0;

  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);

  if (!isValid(d1) || !isValid(d2)) return 0;

  return differenceInDays(d2, d1);
}

export function isDataStale(updatedAt: Date, hoursToLive: number): boolean {
  return differenceInHours(new Date(), updatedAt) > hoursToLive;
}
