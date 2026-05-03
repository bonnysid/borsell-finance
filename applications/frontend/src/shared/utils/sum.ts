import { formatNumber } from '@devbonnysid/ui-kit-default';

export type Labels = {
  thousands: boolean;
  millions: boolean;
};

const MILLION = 1_000_000;
const THOUSAND = 1_000;

export const formatSum = (
  value?: number | string,
  settings: Labels = {
    thousands: true,
    millions: true,
  },
) => {
  if (!value) {
    return '';
  }

  const curr = Number(value);

  if (Number.isNaN(curr)) {
    return '';
  }

  if (settings.millions && curr / MILLION > 1) {
    return `~ ${(curr / MILLION).toString().split('.')[0]} M`;
  }

  if (settings.thousands && curr / THOUSAND > 1) {
    return `~ ${(curr / THOUSAND).toString().split('.')[0]} K`;
  }

  return formatNumber(value);
};
