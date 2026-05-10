import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { format, subDays } from 'date-fns';
import { In, MoreThanOrEqual, Repository } from 'typeorm';

import { NewsArticleEntity, NewsSymbolSyncEntity } from '../entities';

type FinnhubCallback<T> = (error: Error | null, data: T | null, response: unknown) => void;

type FinnhubDefaultApi = {
  companyNews(
    symbol: string,
    from: string,
    to: string,
    callback: FinnhubCallback<FinnhubCompanyNewsItem[]>,
  ): void;
};

type FinnhubModule = {
  DefaultApi: new (apiKey: string) => FinnhubDefaultApi;
};

type FinnhubCompanyNewsItem = {
  category?: string;
  datetime?: number;
  headline?: string;
  id?: number;
  image?: string;
  related?: string;
  source?: string;
  summary?: string;
  url?: string;
};

export type PortfolioNewsItem = {
  symbol: string;
  title: string;
  publisher: string;
  summary?: string | null;
  url: string;
  publishedAt: Date;
};

const FINNHUB_PROVIDER = 'finnhub';
const finnhub = require('finnhub') as FinnhubModule;

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly finnhubApiKey: string | undefined;
  private readonly finnhubClient: FinnhubDefaultApi | undefined;
  private readonly cacheTtlMs: number;
  private readonly lookbackDays: number;
  private readonly perSymbolLimit: number;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(NewsArticleEntity)
    private readonly newsArticleRepo: Repository<NewsArticleEntity>,
    @InjectRepository(NewsSymbolSyncEntity)
    private readonly newsSymbolSyncRepo: Repository<NewsSymbolSyncEntity>,
  ) {
    this.finnhubApiKey = this.configService.get<string>('FINNHUB_API_KEY');
    this.cacheTtlMs = this.getPositiveNumberConfig('NEWS_CACHE_TTL_MINUTES', 180) * 60 * 1000;
    this.lookbackDays = this.getPositiveNumberConfig('NEWS_LOOKBACK_DAYS', 7);
    this.perSymbolLimit = this.getPositiveNumberConfig('NEWS_PER_SYMBOL_LIMIT', 5);
    this.finnhubClient = this.finnhubApiKey
      ? new finnhub.DefaultApi(this.finnhubApiKey)
      : undefined;

    this.logger.log(
      `News service initialized: provider=${FINNHUB_PROVIDER}, ttlMinutes=${this.cacheTtlMs / 60 / 1000}, lookbackDays=${this.lookbackDays}, perSymbolLimit=${this.perSymbolLimit}`,
    );
  }

  async getNews(symbol: string): Promise<PortfolioNewsItem[]> {
    const normalizedSymbol = this.normalizeSymbol(symbol);

    if (!normalizedSymbol) {
      this.logger.debug('Skipping news lookup for empty symbol.');
      return [];
    }

    this.logger.log(`Getting news for symbol=${normalizedSymbol}`);
    await this.refreshStaleSymbols([normalizedSymbol]);

    const articles = await this.getCachedNews([normalizedSymbol]);
    this.logger.log(`Returning ${articles.length} cached news articles for symbol=${normalizedSymbol}`);

    return articles.map((article) => this.toPortfolioNewsItem(article));
  }

  async getPortfolioNews(symbols: string[]): Promise<PortfolioNewsItem[]> {
    const normalizedSymbols = [
      ...new Set(symbols.map((symbol) => this.normalizeSymbol(symbol)).filter(Boolean)),
    ];

    if (normalizedSymbols.length === 0) {
      this.logger.debug('Skipping portfolio news lookup: no valid symbols provided.');
      return [];
    }

    this.logger.log(
      `Getting portfolio news for ${normalizedSymbols.length} symbols: ${normalizedSymbols.join(', ')}`,
    );
    await this.refreshStaleSymbols(normalizedSymbols);

    const articles = await this.getCachedNews(normalizedSymbols);
    this.logger.log(
      `Returning ${articles.length} cached portfolio news articles for symbols=${normalizedSymbols.join(', ')}`,
    );

    return articles.map((article) => this.toPortfolioNewsItem(article));
  }

  private normalizeSymbol(symbol: string): string {
    return symbol.trim().toUpperCase();
  }

  private async refreshStaleSymbols(symbols: string[]) {
    const staleSymbols = await this.getStaleSymbols(symbols);

    if (staleSymbols.length === 0) {
      this.logger.debug(`News cache hit for all symbols: ${symbols.join(', ')}`);
      return;
    }

    this.logger.log(
      `News cache miss for ${staleSymbols.length}/${symbols.length} symbols: ${staleSymbols.join(', ')}`,
    );

    if (!this.finnhubClient) {
      this.logger.warn('FINNHUB_API_KEY is not configured. Using cached news only.');
      return;
    }

    const chunkSize = 5;

    for (let index = 0; index < staleSymbols.length; index += chunkSize) {
      const chunk = staleSymbols.slice(index, index + chunkSize);
      this.logger.log(
        `Refreshing news chunk ${Math.floor(index / chunkSize) + 1}: ${chunk.join(', ')}`,
      );
      await Promise.all(chunk.map((symbol) => this.fetchAndCacheSymbolNews(symbol)));
    }
  }

  private async getStaleSymbols(symbols: string[]): Promise<string[]> {
    const syncs = await this.newsSymbolSyncRepo.find({
      where: { provider: FINNHUB_PROVIDER, symbol: In(symbols) },
    });
    const syncBySymbol = new Map(syncs.map((sync) => [sync.symbol, sync]));
    const now = Date.now();
    const missingSyncCount = symbols.length - syncs.length;

    this.logger.debug(
      `Loaded ${syncs.length} news sync records for ${symbols.length} symbols; missing=${missingSyncCount}`,
    );

    return symbols.filter((symbol) => {
      const sync = syncBySymbol.get(symbol);

      return !sync || now - sync.lastFetchedAt.getTime() > this.cacheTtlMs;
    });
  }

  private async fetchAndCacheSymbolNews(symbol: string) {
    try {
      this.logger.log(`Fetching ${FINNHUB_PROVIDER} news for symbol=${symbol}`);
      const articles = await this.fetchFinnhubCompanyNews(symbol);
      const fetchedAt = new Date();

      if (articles.length > 0) {
        await this.newsArticleRepo.upsert(
          articles.map((article) => this.toNewsArticleEntity(symbol, article, fetchedAt)),
          ['provider', 'symbol', 'externalId'],
        );
        this.logger.log(`Cached ${articles.length} news articles for symbol=${symbol}`);
      } else {
        this.logger.log(`No news returned by ${FINNHUB_PROVIDER} for symbol=${symbol}`);
      }

      await this.newsSymbolSyncRepo.upsert(
        { provider: FINNHUB_PROVIDER, symbol, lastFetchedAt: fetchedAt },
        ['provider', 'symbol'],
      );
      this.logger.debug(`Updated news sync marker for symbol=${symbol}`);
    } catch (error) {
      this.logger.error(`Failed to fetch news for ${symbol}`, error);
    }
  }

  private async fetchFinnhubCompanyNews(symbol: string): Promise<FinnhubCompanyNewsItem[]> {
    const to = new Date();
    const from = subDays(to, this.lookbackDays);
    const fromDate = format(from, 'yyyy-MM-dd');
    const toDate = format(to, 'yyyy-MM-dd');
    this.logger.debug(
      `Requesting ${FINNHUB_PROVIDER} company-news for symbol=${symbol}, from=${fromDate}, to=${toDate}`,
    );

    const client = this.finnhubClient;

    if (!client) {
      return [];
    }

    const data = await new Promise<FinnhubCompanyNewsItem[]>((resolve, reject) => {
      client.companyNews(symbol, fromDate, toDate, (error, responseData) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(Array.isArray(responseData) ? responseData : []);
      });
    });

    const limitedData = data.slice(0, this.perSymbolLimit);
    this.logger.debug(
      `${FINNHUB_PROVIDER} returned ${data.length} articles for symbol=${symbol}; using=${limitedData.length}`,
    );

    return limitedData;
  }

  private toNewsArticleEntity(
    symbol: string,
    item: FinnhubCompanyNewsItem,
    fetchedAt: Date,
  ): Partial<NewsArticleEntity> {
    const publishedAt = item.datetime ? new Date(item.datetime * 1000) : fetchedAt;
    const externalIdSource = item.url ?? item.headline ?? publishedAt.toISOString();
    const fallbackExternalId = createHash('sha256')
      .update(`${symbol}:${externalIdSource}`)
      .digest('hex');

    return {
      provider: FINNHUB_PROVIDER,
      symbol,
      externalId: String(item.id ?? fallbackExternalId),
      title: this.truncate(item.headline?.trim() || 'Untitled market news', 500),
      summary: item.summary?.trim() || null,
      url: item.url?.trim() || '',
      imageUrl: item.image?.trim() || null,
      source: this.truncate(item.source?.trim() || FINNHUB_PROVIDER, 255),
      publishedAt,
      fetchedAt,
    };
  }

  private async getCachedNews(symbols: string[]): Promise<NewsArticleEntity[]> {
    const since = subDays(new Date(), this.lookbackDays);
    this.logger.debug(
      `Loading cached news for symbols=${symbols.join(', ')}, since=${since.toISOString()}`,
    );
    const articles = await this.newsArticleRepo.find({
      where: {
        provider: FINNHUB_PROVIDER,
        symbol: In(symbols),
        publishedAt: MoreThanOrEqual(since),
      },
      order: { publishedAt: 'DESC' },
      take: Math.max(this.perSymbolLimit * symbols.length, 15),
    });

    this.logger.debug(`Loaded ${articles.length} cached news articles from database.`);

    return articles;
  }

  private toPortfolioNewsItem(article: NewsArticleEntity): PortfolioNewsItem {
    return {
      symbol: article.symbol,
      title: article.title,
      publisher: article.source,
      summary: article.summary,
      url: article.url,
      publishedAt: article.publishedAt,
    };
  }

  private truncate(value: string, maxLength: number): string {
    return value.length > maxLength ? value.slice(0, maxLength) : value;
  }

  private getPositiveNumberConfig(key: string, fallback: number): number {
    const value = Number(this.configService.get(key) ?? fallback);

    return Number.isFinite(value) && value > 0 ? value : fallback;
  }
}
