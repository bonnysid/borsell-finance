export type BaseMetadata = {
  iconUrl?: string;
  userNote?: string;
  ticker?: string; // AAPL
  isin?: string; // US0378331005
  exchange?: string; // NASDAQ
  sector?: string; // Technology
  dividendYield?: number; // % дивидендов
  lotSize?: string | number;
  shortName?: string;
  source?: string;
  issueCapitalization?: string;
  valToday?: string;
  contractAddress?: string; // 0xdAC17F958D2ee523a2206206994597C13D831ec7 (для токенов)
  network?: string; // Ethereum, Solana, TRC20
  isStaked?: boolean; // В стейкинге или нет
  maturityDate?: string; // Дата погашения
  couponRate?: number; // Купонный доход
  parValue?: number; // Номинал
  itemName?: string; // AK-47 | Redline
  wear?: number; // 0.150001
  pattern?: number; // Paint Seed
  stickers?: Array<{
    // Массив объектов наклеек
    name: string;
    slot: number;
    wear?: number;
  }>;
  inspectLink?: string;
  isStatTrak?: boolean;
  bankName?: string; // Tinkoff, Revolut
};

// 2. Специфика для Акций (Stock)
export type StockMetadata = {
  moexData?: Record<string, any>;
};

// 3. Специфика для Крипты (Crypto)
export type CryptoMetadata = {};

// 4. Специфика для Скинов (CS:GO / Dota 2)
export type CsGoSkinMetadata = {};

// 5. Специфика для Облигаций (Bond)
export type BondMetadata = {};

// 6. Просто кэш (Fiat / Cash)
export type CashMetadata = {};

export type AssetMetadata = BaseMetadata &
  (StockMetadata | CryptoMetadata | CsGoSkinMetadata | BondMetadata | CashMetadata);
