export const getCssVariable = (name: string): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  return getComputedStyle(document.body).getPropertyValue(name).trim();
};
