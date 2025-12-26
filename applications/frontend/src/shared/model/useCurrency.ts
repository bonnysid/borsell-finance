import { CurrencyCode } from '@packages/types';
import { create } from 'zustand';

type UseCurrencyStore = {
  currency: CurrencyCode | null;
  setCurrency: (currency: CurrencyCode) => void;
};

export const useCurrency = create<UseCurrencyStore>()((set) => ({
  currency: null,
  setCurrency: (currency) => set({ currency }),
}));
