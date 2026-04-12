import { AssetType, CurrencyCode } from '@packages/types';
import Big from 'big.js';

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

export type MoexCharsetInfo = {
  charsetinfo: {
    name: string;
  };
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
