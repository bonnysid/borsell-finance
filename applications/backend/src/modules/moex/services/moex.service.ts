import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateString } from '@packages/types';
import { AxiosRequestConfig, isAxiosError } from 'axios';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

import {
  MoexBoardEntity,
  MoexEngineEntity,
  MoexMarketEntity,
  MoexSecurityEntity,
  MoexTradeEntity,
} from '@/modules/moex/entities';
import {
  GetCandlesMarketDataRequest,
  GetCandlesMarketDataResponse,
  GetSecuritiesMarketDataRequest,
  GetSecuritiesMarketDataResponse,
  GetTradesMarketDataResponse,
  MoexBoardInfo,
  MoexCharsetInfo,
  MoexCursorInfo,
  MoexEngineInfo,
  MoexEngineName,
  MoexHistoryRow,
  MoexMarketInfo,
  MoexMarketName,
  MoexSecurityCardInfo,
  MoexSecurityInfo,
} from '@/modules/moex/moex.types';

@Injectable()
export class MoexService {
  private readonly logger = new Logger(MoexService.name);
  private readonly baseUrl = 'https://iss.moex.com';
  private readonly defaultParams = {
    'iss.meta': 'off',
    'iss.json': 'extended',
  };

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(MoexEngineEntity)
    private readonly engineRepository: Repository<MoexEngineEntity>,
    @InjectRepository(MoexMarketEntity)
    private readonly marketRepository: Repository<MoexMarketEntity>,
    @InjectRepository(MoexBoardEntity)
    private readonly boardRepository: Repository<MoexBoardEntity>,
    @InjectRepository(MoexSecurityEntity)
    private readonly securityRepository: Repository<MoexSecurityEntity>,
    @InjectRepository(MoexTradeEntity)
    private readonly tradeRepository: Repository<MoexTradeEntity>,
  ) {}

  private normalizeParams(params?: Record<string, unknown>) {
    if (!params) return undefined;

    return Object.fromEntries(
      Object.entries(params).map(([key, value]) => {
        if (Array.isArray(value)) {
          return [key, value.join(',')];
        }

        return [key, value];
      }),
    );
  }

  private async getRequest<T>(url: string, params?: AxiosRequestConfig['params']) {
    try {
      const currentParams: AxiosRequestConfig['params'] = this.normalizeParams({
        ...this.defaultParams,
        ...(params || {}),
      });

      this.logger.log(
        `Request url: ${this.baseUrl}${url}?${new URLSearchParams(currentParams).toString()}`,
      );

      const response = await lastValueFrom(
        this.httpService.get<[MoexCharsetInfo, T]>(`${this.baseUrl}${url}`, {
          params: currentParams,
        }),
      );

      return response.data.slice(1).reduce<Record<string, unknown>>((acc, block) => {
        return {
          ...acc,
          ...block,
        };
      }, {}) as T;
    } catch (e) {
      if (isAxiosError(e)) {
        this.logger.error({
          message: 'MOEX request failed',
          url,
          status: e.response?.status,
          data: e.response?.data,
        });

        throw new InternalServerErrorException('MOEX request failed');
      }

      this.logger.error(e);
      throw e;
    }
  }

  private async getPaginatedRequest<TItem>(
    url: string,
    blockName: string,
    params?: Record<string, unknown>,
    limit = 100,
  ): Promise<TItem[]> {
    this.logger.log(
      `Paginated Request url: ${url}, params: ${JSON.stringify(params)}, limit: ${limit}`,
    );
    const result: TItem[] = [];
    let start = 0;

    while (true) {
      const response = await this.getRequest<Record<string, TItem[]>>(url, {
        ...params,
        start,
        limit,
      });

      const items = response?.[blockName] ?? [];

      if (!items.length) {
        break;
      }

      result.push(...items);

      if (items.length < limit) {
        break;
      }

      start += limit;
    }

    return result;
  }

  private async mapWithConcurrency<TInput, TOutput>(
    items: TInput[],
    concurrency: number,
    mapper: (item: TInput) => Promise<TOutput>,
  ): Promise<TOutput[]> {
    const result: TOutput[] = [];
    let index = 0;

    async function worker() {
      while (index < items.length) {
        const currentIndex = index++;
        result[currentIndex] = await mapper(items[currentIndex]);
      }
    }

    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));

    return result;
  }

  // Все торговые системы
  async getEngines(forceRefresh = false): Promise<MoexEngineEntity[]> {
    this.logger.log('Getting engines');
    const fromDB = await this.engineRepository.find();

    if (fromDB.length && !forceRefresh) {
      this.logger.log(`[Cache Hit] Found ${fromDB.length} engines in the database`);
      return fromDB;
    }

    const response = await this.getRequest<{ engines: MoexEngineInfo[] }>('/iss/engines.json');

    const engines = response.engines.map((engine) => {
      return this.engineRepository.create({
        moexId: engine.id,
        name: engine.name,
        title: engine.title,
      });
    });

    await this.engineRepository.save(engines);

    this.logger.log(
      `[${forceRefresh ? 'Force refresh' : 'Cache Miss'}] Saved ${engines.length} engines to the database`,
    );
    return engines;
  }

  // Рынки внутри торговой системы
  async getMarkets(engine: MoexEngineName, forceRefresh = false) {
    this.logger.log(`Getting markets for engine: ${engine}`);

    const fromDB = await this.marketRepository.find({
      where: { engineName: engine },
    });

    if (fromDB.length && !forceRefresh) {
      this.logger.log(
        `[Cache Hit] Found ${fromDB.length} markets in the database for engine: ${engine}`,
      );
      return fromDB;
    }

    const response = await this.getRequest<{ markets: MoexMarketInfo[] }>(
      `/iss/engines/${engine}/markets.json`,
    );

    const markets = response.markets.map((market) => {
      return this.marketRepository.create({
        moexId: market.id,
        name: market.NAME,
        title: market.title,
        engineName: engine,
      });
    });

    await this.marketRepository.save(markets);

    this.logger.log(
      `[${forceRefresh ? 'Force refresh' : 'Cache Miss'}] Saved ${markets.length} markets to the database for engine: ${engine}`,
    );
    return markets;
  }

  // Режимы торгов
  async getBoards(engine: MoexEngineName, marketName: MoexMarketName, forceRefresh = false) {
    this.logger.log(`Getting boards for engine: ${engine}, market: ${marketName}`);

    const fromDB = await this.boardRepository.find({
      where: { engineName: engine, marketName },
    });

    if (fromDB.length && !forceRefresh) {
      this.logger.log(
        `[Cache Hit] Found ${fromDB.length} boards in the database for engine: ${engine}, market: ${marketName}`,
      );
      return fromDB;
    }

    const response = await this.getRequest<{ boards: MoexBoardInfo[] }>(
      `/iss/engines/${engine}/markets/${marketName}/boards.json`,
    );

    const boards = response.boards.map((board) => {
      return this.boardRepository.create({
        boardId: board.boardid,
        boardGroupId: board.board_group_id,
        title: board.title,
        isTraded: board.is_traded === 1,
        marketName,
        engineName: engine,
        moexId: board.id,
      });
    });

    await this.boardRepository.save(boards);

    this.logger.log(
      `[${forceRefresh ? 'Force refresh' : 'Cache Miss'}] Saved ${boards.length} boards to the database for engine: ${engine}, market: ${marketName}`,
    );
    return boards;
  }

  // Список бумаг
  async getSecurities(forceRefresh = false): Promise<MoexSecurityEntity[]> {
    this.logger.log('Getting securities');
    const fromDB = await this.securityRepository.find();

    if (fromDB.length && !forceRefresh) {
      this.logger.log(`[Cache Hit] Found ${fromDB.length} securities in the database`);
      return fromDB;
    }

    const securities = await this.getAllSecurities();

    const entities = securities.map((security) => {
      return this.securityRepository.create({
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
    });

    await this.securityRepository.save(entities);

    this.logger.log(
      `[${forceRefresh ? 'Force refresh' : 'Cache Miss'}] Saved ${entities.length} securities to the database`,
    );
    return entities;
  }

  // Карточка инструмента
  async getSecurityCardInfo(secid: string) {
    return await this.getRequest<MoexSecurityCardInfo>(`/iss/securities/${secid}.json`);
  }

  // Текущие marketdata
  async getSecuritiesMarketData(
    engine: MoexEngineName,
    marketName: MoexMarketName,
    params?: GetSecuritiesMarketDataRequest,
  ) {
    return await this.getRequest<GetSecuritiesMarketDataResponse>(
      `/iss/engines/${engine}/markets/${marketName}/securities.json`,
      params,
    );
  }

  // Сделки
  async getTradesMarketData(
    engine: MoexEngineName,
    marketName: MoexMarketName,
    forceRefresh = false,
  ): Promise<MoexTradeEntity[]> {
    this.logger.log(`Getting trades for engine: ${engine}, market: ${marketName}`);

    const fromDB = await this.tradeRepository.find({
      where: { engineName: engine, marketName },
    });

    if (fromDB.length && !forceRefresh) {
      this.logger.log(
        `[Cache Hit] Found ${fromDB.length} trades in the database for engine: ${engine}, market: ${marketName}`,
      );
      return fromDB;
    }

    const response = await this.getRequest<GetTradesMarketDataResponse>(
      `/iss/engines/${engine}/markets/${marketName}/trades.json`,
    );

    const trades = response.trades.map((trade) => {
      return this.tradeRepository.create({
        tradeNo: trade.TRADENO.toString(),
        secId: trade.SECID,
        boardId: trade.BOARDID,
        price: trade.PRICE.toString(),
        value: trade.VALUE.toString(),
        decimals: trade.DECIMALS,
        tradeDate: trade.TRADEDATE,
        tradeTime: trade.TRADETIME,
        sysTime: new Date(trade.SYSTIME),
        tradeSessionDate: trade.TRADE_SESSION_DATE,
        engineName: engine,
        marketName: marketName,
      });
    });

    await this.tradeRepository.save(trades);

    this.logger.log(
      `[${forceRefresh ? 'Force refresh' : 'Cache Miss'}] Saved ${trades.length} trades to the database for engine: ${engine}, market: ${marketName}`,
    );
    return trades;
  }

  // Свечи
  async getCandlesMarketData(
    engine: MoexEngineName,
    marketName: MoexMarketName,
    secid: string,
    params: GetCandlesMarketDataRequest,
  ) {
    return await this.getRequest<GetCandlesMarketDataResponse>(
      `/iss/engines/${engine}/markets/${marketName}/securities/${secid}/candles.json`,
      {
        ...params,
        interval: params.interval ?? '24',
      },
    );
  }

  async getSecurityHistory(
    engine: MoexEngineName,
    marketName: MoexMarketName,
    secid: string,
    params?: {
      from?: DateString;
      till?: DateString;
      start?: number;
      limit?: number;
      sort_order?: 'asc' | 'desc';
      marketprice_board?: 1;
      'history.columns'?: string | string[];
    },
  ) {
    return await this.getRequest<{
      history: MoexHistoryRow[];
      'history.cursor'?: MoexCursorInfo[];
    }>(
      `/iss/history/engines/${engine}/markets/${marketName}/securities/${encodeURIComponent(secid)}.json`,
      params,
    );
  }

  async searchSecurities(params: {
    q?: string;
    engine?: MoexEngineName;
    market?: MoexMarketName;
    is_trading?: 0 | 1;
    limit?: 5 | 10 | 20 | 100;
    start?: number;
  }) {
    return await this.getRequest<{ securities: MoexSecurityInfo[] }>(
      '/iss/securities.json',
      params,
    );
  }

  async getHistoryMany(params: {
    secids: string[];
    engine: MoexEngineName;
    marketName: MoexMarketName;
    from: DateString;
    till: DateString;
    concurrency?: number;
  }) {
    const pairs = await this.mapWithConcurrency(
      params.secids,
      params.concurrency ?? 5,
      async (secid) => {
        const rows = await this.getPaginatedRequest<MoexHistoryRow>(
          `/iss/history/engines/${params.engine}/markets/${params.marketName}/securities/${encodeURIComponent(secid)}.json`,
          'history',
          {
            from: params.from,
            till: params.till,
          },
        );

        return [secid, rows] as const;
      },
    );

    return Object.fromEntries(pairs) as Record<string, MoexHistoryRow[]>;
  }

  async getSecuritiesPage(params?: {
    q?: string;
    engine?: MoexEngineName;
    market?: MoexMarketName;
    is_trading?: 0 | 1;
    limit?: number;
    start?: number;
  }) {
    return await this.getRequest<{ securities: MoexSecurityInfo[] }>(
      '/iss/securities.json',
      params,
    );
  }

  async getAllSecurities(params?: {
    q?: string;
    engine?: MoexEngineName;
    market?: MoexMarketName;
    is_trading?: 0 | 1;
  }) {
    return await this.getPaginatedRequest<MoexSecurityInfo>(
      '/iss/securities.json',
      'securities',
      params,
    );
  }

  async getBoardSecurityHistory(
    engine: MoexEngineName,
    marketName: MoexMarketName,
    board: string,
    secid: string,
    params?: {
      from?: DateString;
      till?: DateString;
      start?: number;
      limit?: number;
      sort_order?: 'asc' | 'desc';
      marketprice_board?: 1;
      'history.columns'?: string | string[];
    },
  ) {
    return await this.getRequest<{
      history: MoexHistoryRow[];
      'history.cursor'?: MoexCursorInfo[];
    }>(
      `/iss/history/engines/${engine}/markets/${marketName}/boards/${encodeURIComponent(board)}/securities/${encodeURIComponent(secid)}.json`,
      params,
    );
  }

  async getBoardSecuritiesMarketData(
    engine: MoexEngineName,
    marketName: MoexMarketName,
    board: string,
    params?: GetSecuritiesMarketDataRequest,
  ) {
    return await this.getRequest<GetSecuritiesMarketDataResponse>(
      `/iss/engines/${engine}/markets/${marketName}/boards/${encodeURIComponent(board)}/securities.json`,
      params,
    );
  }

  async getBoardCandlesMarketData(
    engine: MoexEngineName,
    marketName: MoexMarketName,
    board: string,
    secid: string,
    params: GetCandlesMarketDataRequest,
  ) {
    return await this.getRequest<GetCandlesMarketDataResponse>(
      `/iss/engines/${engine}/markets/${marketName}/boards/${encodeURIComponent(board)}/securities/${encodeURIComponent(secid)}/candles.json`,
      {
        ...params,
        interval: params.interval ?? '24',
      },
    );
  }

  async getCandlesMany(params: {
    secids: string[];
    engine: MoexEngineName;
    marketName: MoexMarketName;
    from: DateString;
    till: DateString;
    interval?: GetCandlesMarketDataRequest['interval'];
    concurrency?: number;
  }) {
    const pairs = await this.mapWithConcurrency(
      params.secids,
      params.concurrency ?? 5,
      async (secid) => {
        const rows = await this.getPaginatedRequest<
          GetCandlesMarketDataResponse['candles'][number]
        >(
          `/iss/engines/${params.engine}/markets/${params.marketName}/securities/${encodeURIComponent(secid)}/candles.json`,
          'candles',
          {
            from: params.from,
            till: params.till,
            interval: params.interval ?? '24',
          },
        );

        return [secid, rows] as const;
      },
    );

    return Object.fromEntries(pairs);
  }
}
