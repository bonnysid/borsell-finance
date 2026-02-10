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
