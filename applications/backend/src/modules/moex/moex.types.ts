import { AssetType, CurrencyCode, DateString, NumberBoolean } from '@packages/types';
import Big from 'big.js';

export type MoexCharsetInfo = {
  charsetinfo: {
    name: string;
  };
};

export type MoexEngineName =
  | 'stock'
  | 'state'
  | 'currency'
  | 'futures'
  | 'commodity'
  | 'interventions'
  | 'offboard'
  | 'agro'
  | 'otc'
  | 'quotes'
  | 'money'
  | string;

export type MoexMarketName = 'index' | 'share' | string;

export type MoexEngineInfo = {
  id: number;
  name: MoexEngineName;
  title: string;
};

export type MoexMarketInfo = {
  id: number;
  NAME: MoexMarketName;
  title: string;
};

export type MoexBoardInfo = {
  id: number;
  board_group_id: number;
  boardid: string;
  title: string;
  is_traded: 1 | 0;
};

export type MoexSecurityInfo = {
  secid: string; // AAPL-RM
  shortname: string; // Apple
  regnumber: string | null; // "1-02-12500-A"
  name: string; // Apple Inc.
  isin: string | null; // US0378331005
  is_traded: 1 | 0;
  emitent_id: number | null; // 9752
  emitent_title: string | null; // Apple Inc.
  emitent_inn: string | null; // "7727620673"
  emitent_okpo: string | null; // "81521198"
  type: string; // common_share
  group: string; // stock_shares
  primary_boardid: string; // MTQR
  marketprice_boardid: string | null; // TQBR
};

export type MoexSecurityCardInfoBoard = {
  board_group_id: number; // 265;
  boardid: string; // 'FQBR'
  currencyid: CurrencyCode; // 'RUB';
  decimals: number; // 0;
  engine: MoexEngineName; // 'stock';
  engine_id: number; // 1;
  history_from: DateString; // '2020-09-08';
  history_till: DateString; // '2024-03-29';
  is_primary: NumberBoolean; // 0
  is_traded: NumberBoolean; // 0;
  listed_from: DateString; // '2020-09-08';
  listed_till: DateString; // '2024-03-29';
  market: string; // 'foreignshares';
  market_id: number; // 47;
  secid: string; // 'AAPL-RM';
  title: string; // 'Т+ Ин.Акции и ДР - безадрес.';
  unit: string; // 'M';
};

export type MoexSecurityCardInfoDescription = {
  is_hidden: NumberBoolean; // 0;
  name: string; // 'SECID';
  precision: number | null; // null;
  sort_order: number; // 1;
  title: string; // 'Код ценной бумаги';
  type: 'string' | 'number' | 'boolean'; // 'string';
  value: string; // 'AAPL-RM';
};

export type MoexSecurityCardInfo = {
  boards: MoexSecurityCardInfoBoard[];
  description: MoexSecurityCardInfoDescription[];
};

export type MoexSecuritiesMarketDataSecurityInfo = {
  ANNUALHIGH: number; // 235;
  ANNUALLOW: number; // 210;
  BOARDID: string; // 'AGRO';
  CALCMODE: string; // 'PI';
  CURRENCYID: CurrencyCode; // 'RUB';
  DECIMALS: number; // 2;
  NAME: string; // 'Полутуши';
  SECID: string; // 'HHOGSCFO';
  SHORTNAME: string; // 'HHOGSCFO';
};

export type MoexDataVersion = {
  data_version: number; // 8875;
  seqnum: number; // 20260503183521;
  trade_date: DateString; // '2026-05-02';
  trade_session_date: DateString; // '2026-05-02';
};

export type MoexSecuritiesMarketDataInfo = {
  BOARDID: string; // 'AGRO';
  CAPITALIZATION: number; // 0;
  CAPITALIZATION_USD: number; // 0;
  CURRENTVALUE: number; // 0;
  HIGH: number; // 0;
  LASTCHANGE: number; // 0;
  LASTCHANGEBP: number; // 0;
  LASTCHANGEPRC: number; // 0;
  LASTCHANGETOOPEN: number; // 0;
  LASTCHANGETOOPENPRC: number; // 0;
  LASTVALUE: number; // 235;
  LOW: number; // 0;
  MONTHCHANGEBP: number; // 0;
  MONTHCHANGEPRC: number; // 0;
  OPENVALUE: number; // 0;
  SECID: string; // 'HHOGSCFO';
  SEQNUM: number; // 20260503031000;
  SYSTIME: DateString; // '2026-04-24 15:53:35';
  TIME: string; // '15:53:35';
  TRADEDATE: DateString; // '2026-04-24';
  TRADE_SESSION_DATE: DateString; // '2026-04-24';
  TRADINGSESSION: string; // '1';
  UPDATETIME: string; // '15:53:35';
  VALTODAY: number; // 0;
  VALTODAY_USD: number; // 0;
  VOLTODAY: number; // 0;
  YEARCHANGEBP: number; // 0;
  YEARCHANGEPRC: number; // 0;
};

export type GetSecuritiesMarketDataRequest = {
  securities?: string;
};

export type GetSecuritiesMarketDataResponse = {
  dataversion: [MoexDataVersion];
  securities: MoexSecuritiesMarketDataSecurityInfo[];
  marketdata: MoexSecuritiesMarketDataInfo[];
};

export type MoexTradesMarketDataTradeInfo = {
  BOARDID: string; // 'SNDX';
  DECIMALS: number; // 2;
  PRICE: number; // 2645.78;
  SECID: string; // 'IMOEX2';
  SYSTIME: DateString; // '2026-05-03 10:00:02';
  TRADEDATE: DateString; // '2026-05-03';
  TRADENO: number; // 20163048460875;
  TRADETIME: string; //'10:00:02';
  TRADE_SESSION_DATE: DateString; //'2026-05-04';
  VALUE: number; // 12739179.86;
};

export type GetTradesMarketDataResponse = {
  dataversion: [MoexDataVersion];
  trades: MoexTradesMarketDataTradeInfo[];
};

export type MoexCursorInfo = {
  INDEX: number; // 0
  PAGESIZE: number; // 100;
  TOTAL: number; // 9539;
};

export type MoexHistoryRow = {
  ADMITTEDQUOTE: number | null; // 77.71;
  ADMITTEDVALUE: number; // 22830163222.09;
  BOARDID: string; // 'EQBR';
  CLOSE: number | null; //  75.99;
  CURRENCYID: CurrencyCode; // 'SUR';
  HIGH: number | null; //  79.37;
  LEGALCLOSEPRICE: number | null; //  76;
  LOW: number | null; //  75.85;
  MARKETPRICE2: number | null; //  77.71;
  MARKETPRICE3: number | null; //  77.71;
  MARKETPRICE3TRADESVALUE: number; //  22830163222.09;
  MP2VALTRD: number; //  22830163222.09;
  NUMTRADES: number; //  128096;
  OPEN: number | null; //  79;
  SECID: string; // 'SBER';
  SHORTNAME: string; // 'Сбербанк';
  TRADEDATE: DateString; // '2011-11-21';
  TRADE_SESSION_DATE: DateString | null;
  TRADINGSESSION: number; // 3;
  TRENDCLSPR: number | null; // -5.05;
  VALUE: number; // 22830137822.6;
  VOLUME: number; //  293803290;
  WAPRICE: number | null; //  77.71;
  WAVAL: number | null; // null;
};

export type MoexCandleInfo = {
  begin: DateString; // '2024-01-03 00:00:00';
  close: number; // 274.56;
  end: DateString; // '2024-01-03 23:59:59';
  high: number; // 274.7;
  low: number; // 271;
  open: number; // 271.9;
  value: number; // 5631304882.5;
  volume: number; // 20586020;
};

export type GetCandlesMarketDataRequest = {
  from: DateString;
  till: DateString;
  interval?: '24';
};

export type GetCandlesMarketDataResponse = {
  candles: MoexCandleInfo[];
};

export enum MoexColumnsVariants {
  SECID = 'SECID',
  BOARDID = 'BOARDID',
  SECNAME = 'SECNAME',
  BID = 'BID',
  BIDDEPTH = 'BIDDEPTH',
  OFFER = 'OFFER',
  OFFERDEPTH = 'OFFERDEPTH',
  SPREAD = 'SPREAD',
  BIDDEPTHT = 'BIDDEPTHT',
  OFFERDEPTHT = 'OFFERDEPTHT',
  OPEN = 'OPEN',
  LOW = 'LOW',
  HIGH = 'HIGH',
  LAST = 'LAST',
  SEQNAME = 'SEQNAME',
  ISIN = 'ISIN',
  LASTCHANGE = 'LASTCHANGE',
  LOTSIZE = 'LOTSIZE',
  LASTCHANGEPRCNT = 'LASTCHANGEPRCNT',
  QTY = 'QTY',
  VALUE = 'VALUE',
  VALUE_USD = 'VALUE_USD',
  WAPRICE = 'WAPRICE',
  LASTCNGTOLASTWAPRICE = 'LASTCNGTOLASTWAPRICE',
  WAPTOPREVWAPRICEPRCNT = 'WAPTOPREVWAPRICEPRCNT',
  WAPTOPREVWAPRICE = 'WAPTOPREVWAPRICE',
  CLOSEPRICE = 'CLOSEPRICE',
  CLOSE = 'CLOSE',
  MARKETPRICETODAY = 'MARKETPRICETODAY',
  MARKETPRICE = 'MARKETPRICE',
  LASTTOPREVPRICE = 'LASTTOPREVPRICE',
  NUMTRADES = 'NUMTRADES',
  VOLTODAY = 'VOLTODAY',
  VALTODAY = 'VALTODAY',
  VALTODAY_USD = 'VALTODAY_USD',
  ETFSETTLEPRICE = 'ETFSETTLEPRICE',
  TRADINGSTATUS = 'TRADINGSTATUS',
  UPDATETIME = 'UPDATETIME',
  LASTBID = 'LASTBID',
  LASTOFFER = 'LASTOFFER',
  LCLOSEPRICE = 'LCLOSEPRICE',
  LCURRENTPRICE = 'LCURRENTPRICE',
  MARKETPRICE2 = 'MARKETPRICE2',
  NUMBIDS = 'NUMBIDS',
  NUMOFFERS = 'NUMOFFERS',
  CHANGE = 'CHANGE',
  TIME = 'TIME',
  HIGHBID = 'HIGHBID',
  LOWOFFER = 'LOWOFFER',
  PREVWAPRICE = 'PREVWAPRICE',
  PRICEMINUSPREVWAPRICE = 'PRICEMINUSPREVWAPRICE',
  OPENPERIODPRICE = 'OPENPERIODPRICE',
  SEQNUM = 'SEQNUM',
  SYSTIME = 'SYSTIME',
  CLOSINGAUCTIONPRICE = 'CLOSINGAUCTIONPRICE',
  CLOSINGAUCTIONVOLUME = 'CLOSINGAUCTIONVOLUME',
  ISSUECAPITALIZATION = 'ISSUECAPITALIZATION',
  ISSUECAPITALIZATION_UPDATETIME = 'ISSUECAPITALIZATION_UPDATETIME',
  ETFSETTLECURRENCY = 'ETFSETTLECURRENCY',
  VALTODAY_RUR = 'VALTODAY_RUR',
  TRADINGSESSION = 'TRADINGSESSION',
  TRENDISSUECAPITALIZATION = 'TRENDISSUECAPITALIZATION',

  PREVDATE = 'PREVDATE',
  TRADEDATE = 'TRADEDATE',
  SHORTNAME = 'SHORTNAME',
  LEGALCLOSEPRICE = 'LEGALCLOSEPRICE',
  VOLUME = 'VOLUME',
  MARKETPRICE3 = 'MARKETPRICE3',
  ADMITTEDQUOTE = 'ADMITTEDQUOTE',
  MP2VALTRD = 'MP2VALTRD',
  MARKETPRICE3TRADESVALUE = 'MARKETPRICE3TRADESVALUE',
  ADMITTEDVALUE = 'ADMITTEDVALUE',
  WAVAL = 'WAVAL',
}

export type MoexColumnValue = string | number | null;

export type MoexBlock = {
  columns: MoexColumnsVariants[];
  data: MoexColumnValue[][];
};

export type MoexAssetInfoResponse = {
  marketdata: MoexBlock;
  securities: MoexBlock;
};

export type MoexAssetInfoWithPrice = {
  marketdata: Array<Partial<Record<MoexColumnsVariants, MoexColumnValue>>>;
  securities: Array<Partial<Record<MoexColumnsVariants, MoexColumnValue>>>;
};

export type MoexAssetInfoWithPriceResponse = [MoexCharsetInfo, MoexAssetInfoWithPrice];

export type MoexHistoryData = {
  history: MoexBlock;
};

export type MoexCandlesType = {
  id: string;
  slug: string;
  type: string;
  data: [number, number, number, number, number][]; // [timestamp, open, high, low, close]
};

export type MoexVolumesType = {
  id: string;
  slug: string;
  type: string;
  data: [number, number][]; // [timestamp, volume]
};

export type MoexChartResponse = {
  candles: MoexCandlesType[];
  volumes?: MoexVolumesType[];
};

export type MoexAssetHistoryPrice = {
  symbol: string;
  date: Date;
  open: Big.Big;
  high: Big.Big;
  low: Big.Big;
  close: Big.Big;
  volume: Big.Big;
  currencyCode: CurrencyCode;
  isSynthesized?: boolean;
};

export type MoexAssetInfo = {
  symbol: string;
  isin?: string;
  name?: string;
  shortName?: string;
  lotSize?: Big.Big;
  date: Date;

  open: Big.Big;
  high: Big.Big;
  low: Big.Big;
  close: Big.Big;
  lastPrice: Big.Big;
  prevWaPrice?: Big.Big;
  prevDate?: Date | null;
  volume: Big.Big;
  changePercent: Big.Big;

  issueCapitalization?: Big.Big | null; // Капитализация
  valToday?: Big.Big | null; // Объем торгов за сегодня в рублях

  moexData?: Record<string, any>;
  isSynthesized?: boolean;

  currencyCode: CurrencyCode;
  type: AssetType;
};
