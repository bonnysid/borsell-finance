import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetType, CurrencyCode } from '@packages/types';
import Big from 'big.js';
import { addDays, isValid, subDays } from 'date-fns';
import { Repository } from 'typeorm';

import { formatDateToSqlDate, normalizeDate } from '@/common';
import { AssetEntity } from '@/modules/asset/entities';
import { MoexBoardEntity, MoexSecurityEntity } from '@/modules/moex/entities';
import {
  GetSecuritiesMarketDataResponse,
  MoexAssetHistoryPrice,
  MoexAssetInfo,
  MoexEngineName,
  MoexMarketName,
  MoexSecurityContext,
} from '@/modules/moex/moex.types';

import { MoexService } from './moex.service';

type MarketDataRow = GetSecuritiesMarketDataResponse['marketdata'][number] &
  Record<string, unknown>;
type SecurityRow = GetSecuritiesMarketDataResponse['securities'][number] & Record<string, unknown>;

type AssetCandlesQuery = {
  candles?: number;
  isFromTo?: boolean;
  from?: Date;
  to?: Date;
};

@Injectable()
export class MoexAssetService {
  private readonly logger = new Logger(MoexAssetService.name);
  private readonly defaultEngine: MoexEngineName = 'stock';
  private readonly defaultMarket: MoexMarketName = 'shares';
  private readonly defaultStockBoard = 'TQBR';
  private readonly defaultEtfBoard = 'TQTF';
  private readonly contextCache = new Map<string, MoexSecurityContext>();

  constructor(
    private readonly moexService: MoexService,
    @InjectRepository(MoexSecurityEntity)
    private readonly securityRepository: Repository<MoexSecurityEntity>,
    @InjectRepository(MoexBoardEntity)
    private readonly boardRepository: Repository<MoexBoardEntity>,
  ) {}

  async getAssetInfo(symbol: string): Promise<MoexAssetInfo | null> {
    const [info] = await this.getAssetsInfo([symbol]);
    return info ?? null;
  }

  async getAssetsInfoByEntity(assets: AssetEntity[]): Promise<MoexAssetInfo[]> {
    return this.getAssetsInfo(
      assets.map((asset) => asset.symbol),
      assets,
    );
  }

  async getAssetsInfo(symbols: string[], assets: AssetEntity[] = []): Promise<MoexAssetInfo[]> {
    const normalizedSymbols = [...new Set(symbols.map((it) => it.toUpperCase()))];
    const assetsBySymbol = new Map(assets.map((asset) => [asset.symbol.toUpperCase(), asset]));
    const contexts = await this.resolveContexts(normalizedSymbols, assetsBySymbol);
    const result: MoexAssetInfo[] = [];

    for (const [contextKey, symbolsInContext] of this.groupSymbolsByContext(contexts)) {
      const context = contexts.get(symbolsInContext[0]);
      if (!context) continue;

      try {
        const response = await this.moexService.getBoardSecuritiesMarketData(
          context.engineName,
          context.marketName,
          context.boardId,
          { securities: symbolsInContext.join(',') },
        );

        result.push(...this.mapMarketDataResponse(response, context));
      } catch (error) {
        this.logger.error(`Failed to load MOEX asset data for ${contextKey}`, error);
      }
    }

    return result;
  }

  async getTopAssets(type: AssetType): Promise<MoexAssetInfo[]> {
    const context = this.getDefaultContext(type);

    const response = await this.moexService.getBoardSecuritiesMarketData(
      context.engineName,
      context.marketName,
      context.boardId,
    );

    return this.mapMarketDataResponse(response, context)
      .filter((asset) => asset.lastPrice.gt(0))
      .sort((a, b) => b.valToday?.cmp(a.valToday ?? 0) ?? 0);
  }

  async getCandles(symbol: string, query: AssetCandlesQuery): Promise<MoexAssetHistoryPrice[]> {
    const normalizedSymbol = symbol.toUpperCase();
    const context = await this.resolveContext(normalizedSymbol);
    const to = normalizeDate(query.to ?? new Date());
    const from =
      query.isFromTo && query.from
        ? normalizeDate(query.from)
        : subDays(to, Math.ceil((query.candles ?? 500) * 1.8) + 10);

    const response = await this.moexService.getBoardCandlesMarketData(
      context.engineName,
      context.marketName,
      context.boardId,
      normalizedSymbol,
      {
        from: formatDateToSqlDate(from),
        till: formatDateToSqlDate(to),
        interval: '24',
      },
    );

    const candles = response.candles
      .map((candle) => ({
        symbol: normalizedSymbol,
        date: new Date(candle.begin),
        open: new Big(candle.open ?? 0),
        high: new Big(candle.high ?? 0),
        low: new Big(candle.low ?? 0),
        close: new Big(candle.close ?? 0),
        volume: new Big(candle.value ?? 0),
        currencyCode: this.normalizeCurrencyCode('RUB'),
      }))
      .filter((candle) => candle.close.gt(0));

    const filled = this.fillGaps(candles, from, to);
    return query.isFromTo ? filled : filled.slice(-(query.candles ?? 500));
  }

  fillGaps(records: MoexAssetHistoryPrice[], from?: Date, to?: Date): MoexAssetHistoryPrice[] {
    if (records.length === 0) return [];

    const sortedRecords = [...records].sort((a, b) => a.date.getTime() - b.date.getTime());
    const byDate = new Map(
      sortedRecords.map((record) => [formatDateToSqlDate(record.date), record]),
    );
    const startDate = normalizeDate(from ?? sortedRecords[0].date);
    const endDate = normalizeDate(to ?? sortedRecords[sortedRecords.length - 1].date);
    const fallbackRecord = sortedRecords[0];
    const result: MoexAssetHistoryPrice[] = [];
    let cursor = startDate;
    let previousRecord: MoexAssetHistoryPrice | undefined;

    while (cursor <= endDate) {
      const dateKey = formatDateToSqlDate(cursor);
      const actualRecord = byDate.get(dateKey);

      if (actualRecord) {
        result.push(actualRecord);
        previousRecord = actualRecord;
      } else {
        const baseRecord = previousRecord ?? fallbackRecord;
        const close = baseRecord.close;

        result.push({
          symbol: baseRecord.symbol,
          date: new Date(`${dateKey}T00:00:00.000Z`),
          open: close,
          high: close,
          low: close,
          close,
          volume: new Big(0),
          currencyCode: baseRecord.currencyCode,
          isSynthesized: true,
        });
      }

      cursor = addDays(cursor, 1);
    }

    return result;
  }

  private async resolveContexts(
    symbols: string[],
    assetsBySymbol = new Map<string, AssetEntity>(),
  ) {
    const contexts = new Map<string, MoexSecurityContext>();

    for (const symbol of symbols) {
      contexts.set(symbol, await this.resolveContext(symbol, assetsBySymbol.get(symbol)));
    }

    return contexts;
  }

  private async resolveContext(
    symbol: string,
    assetEntity?: AssetEntity,
  ): Promise<MoexSecurityContext> {
    const assetContext = this.resolveContextFromAsset(symbol, assetEntity);
    if (assetContext) {
      this.contextCache.set(symbol, assetContext);
      return assetContext;
    }

    const cached = this.contextCache.get(symbol);
    if (cached) return cached;

    const security = await this.resolveSecurity(symbol);
    const preferredBoardId = security?.marketPriceBoardId || security?.primaryBoardId || undefined;
    const boardContext = await this.resolveBoardContext(symbol, preferredBoardId);

    const context: MoexSecurityContext = {
      ...boardContext,
      securityId: symbol,
      assetType: security ? this.resolveAssetType(security as unknown as SecurityRow) : undefined,
      primaryBoardId: security?.primaryBoardId ?? null,
      marketPriceBoardId: security?.marketPriceBoardId ?? null,
    };

    this.contextCache.set(symbol, context);
    return context;
  }

  private resolveContextFromAsset(
    symbol: string,
    assetEntity?: AssetEntity,
  ): MoexSecurityContext | null {
    if (!assetEntity) return null;

    const metadataMoex = assetEntity.metadata?.moex;
    const engineName = assetEntity.moexEngineName ?? metadataMoex?.engineName;
    const marketName = assetEntity.moexMarketName ?? metadataMoex?.marketName;
    const boardId = assetEntity.moexBoardId ?? metadataMoex?.boardId;

    if (!engineName || !marketName || !boardId) return null;

    return {
      engineName: engineName as MoexEngineName,
      marketName: marketName as MoexMarketName,
      boardId,
      securityId: assetEntity.moexSecurityId ?? metadataMoex?.securityId ?? symbol,
      assetType: assetEntity.type,
      primaryBoardId: metadataMoex?.primaryBoardId ?? null,
      marketPriceBoardId: metadataMoex?.marketPriceBoardId ?? null,
    };
  }

  private async resolveSecurity(symbol: string) {
    const existingSecurity = await this.securityRepository.findOne({
      where: { secId: symbol },
    });
    if (existingSecurity) return existingSecurity;

    const searchResult = await this.moexService.searchSecurities({
      q: symbol,
      engine: this.defaultEngine,
      is_trading: 1,
      limit: 20,
    });

    const security = searchResult.securities.find((it) => it.secid.toUpperCase() === symbol);
    if (!security) return null;

    const entity = this.securityRepository.create({
      secId: security.secid,
      shortName: security.shortname,
      name: security.name,
      regNumber: security.regnumber,
      isin: security.isin,
      isTraded: security.is_traded === 1,
      emitentId: security.emitent_id,
      emitentTitle: security.emitent_title,
      emitentInn: security.emitent_inn,
      emitentOkpo: security.emitent_okpo,
      type: security.type,
      group: security.group,
      primaryBoardId: security.primary_boardid,
      marketPriceBoardId: security.marketprice_boardid,
    });

    await this.securityRepository.upsert(entity, {
      conflictPaths: ['secId'],
      skipUpdateIfNoValuesChanged: true,
    });

    return await this.securityRepository.findOne({
      where: { secId: security.secid },
    });
  }

  private async resolveBoardContext(symbol: string, preferredBoardId?: string) {
    const card = await this.moexService.getSecurityCardInfo(symbol);
    const boards = card.boards ?? [];
    const preferredBoard = preferredBoardId
      ? boards.find((board) => board.boardid === preferredBoardId)
      : undefined;
    const board =
      preferredBoard ||
      boards.find((it) => it.is_traded === 1 && it.engine === this.defaultEngine) ||
      boards.find((it) => it.engine === this.defaultEngine) ||
      boards[0];

    if (board) {
      return {
        engineName: board.engine,
        marketName: board.market,
        boardId: board.boardid,
      };
    }

    const localBoard = preferredBoardId
      ? await this.boardRepository.findOne({ where: { boardId: preferredBoardId } })
      : null;

    return {
      engineName: (localBoard?.engineName ?? this.defaultEngine) as MoexEngineName,
      marketName: (localBoard?.marketName ?? this.defaultMarket) as MoexMarketName,
      boardId: preferredBoardId ?? this.defaultStockBoard,
    };
  }

  private groupSymbolsByContext(contexts: Map<string, MoexSecurityContext>) {
    const result = new Map<string, string[]>();

    for (const [symbol, context] of contexts) {
      const key = `${context.engineName}:${context.marketName}:${context.boardId}`;
      result.set(key, [...(result.get(key) ?? []), symbol]);
    }

    return result;
  }

  private mapMarketDataResponse(
    response: GetSecuritiesMarketDataResponse,
    context: MoexSecurityContext,
  ): MoexAssetInfo[] {
    return response.securities
      .map((security) => {
        const marketData = response.marketdata.find((it) => it.SECID === security.SECID);
        if (!marketData) return null;

        return this.mapAssetInfo(security, marketData, context);
      })
      .filter(Boolean) as MoexAssetInfo[];
  }

  private mapAssetInfo(
    security: SecurityRow,
    marketData: MarketDataRow,
    context: MoexSecurityContext,
  ): MoexAssetInfo {
    const lastPrice = this.bigFromFirst(
      marketData.LAST,
      marketData.MARKETPRICE,
      marketData.LCURRENTPRICE,
      marketData.CLOSEPRICE,
      marketData.PREVWAPRICE,
      0,
    );
    const date = this.resolveMarketDataDate(marketData);

    return {
      symbol: String(security.SECID),
      isin: this.stringFromFirst(security.ISIN),
      name: this.stringFromFirst(security.SECNAME, security.NAME),
      shortName: this.stringFromFirst(security.SHORTNAME, security.SECID),
      lotSize: this.bigFromFirst(security.LOTSIZE),
      date,
      open: this.bigFromFirst(marketData.OPEN, marketData.OPENPERIODPRICE, lastPrice),
      high: this.bigFromFirst(marketData.HIGH, lastPrice),
      low: this.bigFromFirst(marketData.LOW, lastPrice),
      close: this.bigFromFirst(marketData.CLOSE, marketData.CLOSEPRICE, lastPrice),
      lastPrice,
      prevWaPrice: this.bigFromFirst(marketData.PREVWAPRICE),
      prevDate: this.parseDateValue(marketData.PREVDATE),
      volume: this.bigFromFirst(marketData.VALTODAY, marketData.VOLTODAY, marketData.VOLUME, 0),
      changePercent: this.bigFromFirst(
        marketData.LASTCHANGEPRCNT,
        marketData.LASTCHANGEPRC,
        marketData.WAPTOPREVWAPRICEPRCNT,
        0,
      ),
      issueCapitalization: this.bigFromFirst(marketData.ISSUECAPITALIZATION),
      valToday: this.bigFromFirst(marketData.VALTODAY, marketData.VALTODAY_RUR, 0),
      moexData: {
        security,
        marketData,
      },
      currencyCode: this.normalizeCurrencyCode(security.CURRENCYID ?? marketData.CURRENCYID),
      type: context.assetType ?? this.resolveAssetType(security),
      context: {
        ...context,
        boardId: marketData.BOARDID ?? security.BOARDID ?? context.boardId,
        securityId: String(security.SECID),
      },
    };
  }

  private getDefaultContext(type: AssetType): MoexSecurityContext {
    return {
      engineName: this.defaultEngine,
      marketName: this.defaultMarket,
      boardId: type === AssetType.ETF ? this.defaultEtfBoard : this.defaultStockBoard,
      securityId: '',
      assetType: type,
    };
  }

  private resolveAssetType(security: SecurityRow): AssetType {
    const rawType = String(security.TYPE ?? security.type ?? '').toLowerCase();
    const rawGroup = String(security.GROUP ?? security.group ?? '').toLowerCase();
    const rawName = String(security.SECNAME ?? security.SHORTNAME ?? '').toLowerCase();

    if (
      rawType.includes('etf') ||
      rawType.includes('fund') ||
      rawGroup.includes('etf') ||
      rawGroup.includes('ppif') ||
      rawName.includes('etf') ||
      rawName.includes('бпиф')
    ) {
      return AssetType.ETF;
    }

    return AssetType.STOCK;
  }

  private bigFromFirst(...values: unknown[]): Big.Big {
    const value = values.find((it) => it !== undefined && it !== null && it !== '');
    return new Big((value ?? 0) as Big.BigSource);
  }

  private stringFromFirst(...values: unknown[]): string | undefined {
    const value = values.find((it) => it !== undefined && it !== null && it !== '');
    return value === undefined ? undefined : String(value);
  }

  private resolveMarketDataDate(marketData: MarketDataRow): Date {
    const sysTimeDate = this.parseDateValue(marketData.SYSTIME);
    if (sysTimeDate) return sysTimeDate;

    const tradeDate = this.stringFromFirst(marketData.TRADEDATE);
    const updateTime = this.stringFromFirst(marketData.TIME, marketData.UPDATETIME);
    const combinedDate =
      tradeDate && updateTime ? this.parseDateValue(`${tradeDate} ${updateTime}`) : null;
    if (combinedDate) return combinedDate;

    return this.parseDateValue(tradeDate) ?? new Date();
  }

  private parseDateValue(value: unknown): Date | null {
    if (value === undefined || value === null || value === '') return null;

    const rawValue = String(value).trim();
    if (!rawValue || rawValue === '0' || rawValue.startsWith('0000')) return null;

    const date = new Date(rawValue);
    return isValid(date) ? date : null;
  }

  private normalizeCurrencyCode(value: unknown): CurrencyCode {
    const code = this.stringFromFirst(value)?.toUpperCase();

    if (!code || code === 'SUR' || code === 'RUR') {
      return 'RUB';
    }

    return code;
  }
}
