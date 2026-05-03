import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { DateString } from '@packages/types';
import { AxiosRequestConfig, isAxiosError } from 'axios';
import { lastValueFrom } from 'rxjs';

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

  constructor(private readonly httpService: HttpService) {}

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
      this.logger.log(`Request url: ${url}`);

      const currentParams: AxiosRequestConfig['params'] = this.normalizeParams({
        ...this.defaultParams,
        ...(params || {}),
      });

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
  async getEngines() {
    return await this.getRequest<{ engines: MoexEngineInfo[] }>('/iss/engines.json');
  }

  // Рынки внутри торговой системы
  async getMarkets(engine: MoexEngineName) {
    return await this.getRequest<{ markets: MoexMarketInfo[] }>(
      `/iss/engines/${engine}/markets.json`,
    );
  }

  // Режимы торгов
  async getBoards(engine: MoexEngineName, marketName: MoexMarketName) {
    return await this.getRequest<{ boards: MoexBoardInfo[] }>(
      `/iss/engines/${engine}/markets/${marketName}/boards.json`,
    );
  }

  // Список бумаг
  async getSecurities() {
    return await this.getRequest<{ securities: MoexSecurityInfo[] }>('/iss/securities.json');
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
  async getTradesMarketData(engine: MoexEngineName, marketName: MoexMarketName) {
    return await this.getRequest<GetTradesMarketDataResponse>(
      `/iss/engines/${engine}/markets/${marketName}/trades.json`,
    );
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
