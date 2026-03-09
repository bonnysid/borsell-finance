/**
 * Преобразует дату в строку формата YYYY-MM-DD.
 * Полезно для сравнения дат без учета времени.
 */
export function formatDateToSqlDate(date: Date | string): string {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  return dateObj.toISOString().split('T')[0];
}

/**
 * Сравнивает две даты по календарному дню (год, месяц, день).
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = formatDateToSqlDate(date1);
  const d2 = formatDateToSqlDate(date2);
  return !!d1 && !!d2 && d1 === d2;
}

/**
 * Возвращает разницу в днях между двумя датами.
 */
export function getDaysDifference(date1: Date | string, date2: Date | string = new Date()): number {
  if (!date1 || !date2) return 0;

  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;

  // Сбрасываем время до начала дня для обеих дат
  const start1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const start2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());

  const diffInMs = start2.getTime() - start1.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return Math.round(diffInDays);
}
