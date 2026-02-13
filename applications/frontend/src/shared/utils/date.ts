export const formatDateDDMMYYYYHHMM = (date: Date | string) =>
  new Date(date).toLocaleDateString(undefined, { hour: '2-digit', minute: '2-digit' });
export const formatDateDDMMYYYY = (date: Date | string) =>
  new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
