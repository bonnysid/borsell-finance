export type BaseMetadata = {
  iconUrl?: string;
  userNote?: string;
};

// 2. Специфика для Акций (Stock)
export type StockMetadata = {
  ticker: string; // AAPL
  isin?: string; // US0378331005
  exchange?: string; // NASDAQ
  sector?: string; // Technology
  dividendYield?: number; // % дивидендов
};

// 3. Специфика для Крипты (Crypto)
export type CryptoMetadata = {
  ticker: string; // BTC
  contractAddress?: string; // 0xdAC17F958D2ee523a2206206994597C13D831ec7 (для токенов)
  network?: string; // Ethereum, Solana, TRC20
  isStaked?: boolean; // В стейкинге или нет
};

// 4. Специфика для Скинов (CS:GO / Dota 2)
export type CsGoSkinMetadata = {
  itemName: string; // AK-47 | Redline
  wear: number; // 0.150001
  pattern?: number; // Paint Seed
  stickers?: Array<{
    // Массив объектов наклеек
    name: string;
    slot: number;
    wear?: number;
  }>;
  inspectLink?: string;
  isStatTrak?: boolean;
};

// 5. Специфика для Облигаций (Bond)
export type BondMetadata = {
  isin: string;
  maturityDate: string; // Дата погашения
  couponRate: number; // Купонный доход
  parValue: number; // Номинал
};

// 6. Просто кэш (Fiat / Cash)
export type CashMetadata = {
  bankName?: string; // Tinkoff, Revolut
};

export type AssetMetadata = BaseMetadata &
  (StockMetadata | CryptoMetadata | CsGoSkinMetadata | BondMetadata | CashMetadata);
