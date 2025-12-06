import { CurrencyDtoShape } from '../currency';

export enum PortfolioType {
  MAIN = 'MAIN', // Реальный портфель
  WATCHLIST = 'WATCHLIST', // Просто слежу
  SIMULATION = 'SIMULATION', // Демо-счет
}

export type PortfolioDtoShape = {
  id: string;
  userId: string;

  name: string;
  description?: string; // Полезно для заметок ("Портфель на пенсию")

  // Важно: Валюта, в которую конвертируются все цены для отображения (USD, EUR, RUB)
  currency: CurrencyDtoShape;

  // Тип портфеля
  type: PortfolioType;

  // --- Денормализация (Кэш) ---
  // Обновляем это поле фоновым джобом, чтобы не считать каждый раз при чтении
  cachedTotalValue: number;
  cachedDailyChangePercent: number;
  lastValuationAt: string; // Когда последний раз обновляли цены

  // --- Связи ---
  // assets: Asset[];
  // snapshots: PortfolioSnapshot[];

  createdAt: string;
  updatedAt: string;
};
