import { createHash } from 'crypto';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { format, subDays } from 'date-fns';
import { firstValueFrom } from 'rxjs';
import { In, MoreThanOrEqual, Repository } from 'typeorm';

import { NewsArticleEntity, NewsSymbolSyncEntity } from '../entities';

type NewsProviderName = 'finnhub' | 'marketaux';

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

type MarketauxNewsResponse = {
  data?: MarketauxNewsItem[];
};

type MarketauxNewsItem = {
  uuid?: string;
  title?: string;
  description?: string;
  snippet?: string;
  url?: string;
  image_url?: string;
  source?: string | { name?: string; domain?: string };
  published_at?: string;
};

type PortfolioNewsAsset = {
  symbol: string;
  name?: string;
  currencyCode?: string;
  source?: string;
};

export type PortfolioNewsItem = {
  symbol: string;
  title: string;
  publisher: string;
  summary?: string | null;
  url: string;
  publishedAt: Date;
};

const FINNHUB_PROVIDER: NewsProviderName = 'finnhub';
const MARKETAUX_PROVIDER: NewsProviderName = 'marketaux';
const finnhub = require('finnhub') as FinnhubModule;

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly finnhubApiKey: string | undefined;
  private readonly marketauxApiKey: string | undefined;
  private readonly finnhubClient: FinnhubDefaultApi | undefined;
  private readonly cacheTtlMs: number;
  private readonly lookbackDays: number;
  private readonly perSymbolLimit: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(NewsArticleEntity)
    private readonly newsArticleRepo: Repository<NewsArticleEntity>,
    @InjectRepository(NewsSymbolSyncEntity)
    private readonly newsSymbolSyncRepo: Repository<NewsSymbolSyncEntity>,
  ) {
    this.finnhubApiKey = this.configService.get<string>('FINNHUB_API_KEY');
    this.marketauxApiKey = this.configService.get<string>('MARKETAUX_API_KEY');
    this.cacheTtlMs = this.getPositiveNumberConfig('NEWS_CACHE_TTL_MINUTES', 180) * 60 * 1000;
    this.lookbackDays = this.getPositiveNumberConfig('NEWS_LOOKBACK_DAYS', 7);
    this.perSymbolLimit = this.getPositiveNumberConfig('NEWS_PER_SYMBOL_LIMIT', 5);
    this.finnhubClient = this.finnhubApiKey
      ? new finnhub.DefaultApi(this.finnhubApiKey)
      : undefined;

    this.logger.log(
      `News service initialized: providers=${MARKETAUX_PROVIDER},${FINNHUB_PROVIDER}, ttlMinutes=${this.cacheTtlMs / 60 / 1000}, lookbackDays=${this.lookbackDays}, perSymbolLimit=${this.perSymbolLimit}`,
    );
  }

  async getNews(symbol: string): Promise<PortfolioNewsItem[]> {
    const normalizedSymbol = this.normalizeSymbol(symbol);

    if (!normalizedSymbol) {
      this.logger.debug('Skipping news lookup for empty symbol.');
      return [];
    }

    this.logger.log(`Getting news for symbol=${normalizedSymbol}`);
    const articles = await this.getNewsForAsset({ symbol: normalizedSymbol });

    this.logger.log(
      `Returning ${articles.length} cached news articles for symbol=${normalizedSymbol}`,
    );

    return articles.map((article) => this.toPortfolioNewsItem(article));
  }

  async getPortfolioNews(assets: Array<string | PortfolioNewsAsset>): Promise<PortfolioNewsItem[]> {
    const normalizedAssets = this.normalizeAssets(assets);

    if (normalizedAssets.length === 0) {
      this.logger.debug('Skipping portfolio news lookup: no valid symbols provided.');
      return [];
    }

    this.logger.log(
      `Getting portfolio news for ${normalizedAssets.length} symbols: ${normalizedAssets
        .map((asset) => asset.symbol)
        .join(', ')}`,
    );

    const articles = (
      await Promise.all(normalizedAssets.map((asset) => this.getNewsForAsset(asset)))
    )
      .flat()
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    this.logger.log(
      `Returning ${articles.length} cached portfolio news articles for symbols=${normalizedAssets
        .map((asset) => asset.symbol)
        .join(', ')}`,
    );

    return articles.map((article) => this.toPortfolioNewsItem(article));
  }

  private normalizeAssets(assets: Array<string | PortfolioNewsAsset>): PortfolioNewsAsset[] {
    const bySymbol = new Map<string, PortfolioNewsAsset>();

    for (const asset of assets) {
      const normalizedAsset =
        typeof asset === 'string' ? { symbol: this.normalizeSymbol(asset) } : asset;
      const normalizedSymbol = this.normalizeSymbol(normalizedAsset.symbol);

      if (!normalizedSymbol || bySymbol.has(normalizedSymbol)) {
        continue;
      }

      bySymbol.set(normalizedSymbol, {
        ...normalizedAsset,
        symbol: normalizedSymbol,
        source: normalizedAsset.source?.toUpperCase(),
      });
    }

    return [...bySymbol.values()];
  }

  private normalizeSymbol(symbol: string): string {
    return symbol.trim().toUpperCase();
  }

  private async getNewsForAsset(asset: PortfolioNewsAsset): Promise<NewsArticleEntity[]> {
    const providers = this.getProviderOrder(asset);
    this.logger.debug(`Provider order for ${asset.symbol}: ${providers.join(' -> ')}`);

    for (const provider of providers) {
      await this.refreshStaleAsset(provider, asset);

      const articles = await this.getCachedNews(provider, [asset.symbol]);

      if (articles.length > 0) {
        this.logger.debug(
          `Using ${articles.length} cached articles from provider=${provider} for symbol=${asset.symbol}`,
        );
        return articles;
      }

      this.logger.debug(
        `No cached articles from provider=${provider} for symbol=${asset.symbol}; trying next provider`,
      );
    }

    return [];
  }

  private getProviderOrder(asset: PortfolioNewsAsset): NewsProviderName[] {
    if (this.isLikelyRussianAsset(asset)) {
      this.logger.debug(
        `Russian asset detected for symbol=${asset.symbol}; skipping global news providers until a Russian provider is configured`,
      );
      return [];
    }

    return [FINNHUB_PROVIDER, MARKETAUX_PROVIDER];
  }

  private isLikelyRussianAsset(asset: PortfolioNewsAsset): boolean {
    return (
      asset.currencyCode === 'RUB' ||
      asset.source === 'MOEX' ||
      asset.symbol.endsWith('.ME') ||
      asset.symbol.endsWith('.MOEX')
    );
  }

  private async refreshStaleAsset(provider: NewsProviderName, asset: PortfolioNewsAsset) {
    const isStale = await this.isSymbolStale(provider, asset.symbol);

    if (!isStale) {
      this.logger.debug(`News cache hit for provider=${provider}, symbol=${asset.symbol}`);
      return;
    }

    this.logger.log(`News cache miss for provider=${provider}, symbol=${asset.symbol}`);

    if (!this.isProviderConfigured(provider)) {
      this.logger.warn(`${provider} API key is not configured. Using cached news only.`);
      return;
    }

    await this.fetchAndCacheSymbolNews(provider, asset);
  }

  private async isSymbolStale(provider: NewsProviderName, symbol: string): Promise<boolean> {
    const sync = await this.newsSymbolSyncRepo.findOne({
      where: { provider, symbol },
    });

    if (!sync) {
      this.logger.debug(`No sync marker for provider=${provider}, symbol=${symbol}`);
      return true;
    }

    const ageMs = Date.now() - sync.lastFetchedAt.getTime();
    const isStale = ageMs > this.cacheTtlMs;
    this.logger.debug(
      `Sync marker for provider=${provider}, symbol=${symbol}: ageMinutes=${(ageMs / 60 / 1000).toFixed(1)}, stale=${isStale}`,
    );

    return isStale;
  }

  private isProviderConfigured(provider: NewsProviderName): boolean {
    return provider === FINNHUB_PROVIDER
      ? Boolean(this.finnhubClient)
      : Boolean(this.marketauxApiKey);
  }

  private async fetchAndCacheSymbolNews(provider: NewsProviderName, asset: PortfolioNewsAsset) {
    try {
      this.logger.log(`Fetching ${provider} news for symbol=${asset.symbol}`);
      const articles = await this.fetchProviderCompanyNews(provider, asset);
      const fetchedAt = new Date();

      if (articles.length > 0) {
        await this.newsArticleRepo.upsert(
          articles.map((article) =>
            this.toNewsArticleEntity(provider, asset.symbol, article, fetchedAt),
          ),
          ['provider', 'symbol', 'externalId'],
        );
        this.logger.log(
          `Cached ${articles.length} ${provider} news articles for symbol=${asset.symbol}`,
        );
      } else {
        this.logger.log(`No news returned by ${provider} for symbol=${asset.symbol}`);
      }

      await this.newsSymbolSyncRepo.upsert(
        { provider, symbol: asset.symbol, lastFetchedAt: fetchedAt },
        ['provider', 'symbol'],
      );
      this.logger.debug(
        `Updated news sync marker for provider=${provider}, symbol=${asset.symbol}`,
      );
    } catch (error) {
      this.logger.error(`Failed to fetch ${provider} news for ${asset.symbol}`, error);
    }
  }

  private fetchProviderCompanyNews(
    provider: NewsProviderName,
    asset: PortfolioNewsAsset,
  ): Promise<Array<FinnhubCompanyNewsItem | MarketauxNewsItem>> {
    if (provider === FINNHUB_PROVIDER) {
      return this.fetchFinnhubCompanyNews(asset.symbol);
    }

    return this.fetchMarketauxCompanyNews(asset);
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

  private async fetchMarketauxCompanyNews(asset: PortfolioNewsAsset): Promise<MarketauxNewsItem[]> {
    if (!this.marketauxApiKey) {
      return [];
    }

    const from = subDays(new Date(), this.lookbackDays);
    const symbols = this.getMarketauxSymbols(asset);
    this.logger.debug(
      `Requesting ${MARKETAUX_PROVIDER} news for symbol=${asset.symbol}, symbols=${symbols.join(', ')}, since=${from.toISOString()}`,
    );

    const response = await firstValueFrom(
      this.httpService.get<MarketauxNewsResponse>('https://api.marketaux.com/v1/news/all', {
        params: {
          api_token: this.marketauxApiKey,
          symbols: symbols.join(','),
          countries: this.isLikelyRussianAsset(asset) ? 'ru' : undefined,
          language: this.isLikelyRussianAsset(asset) ? 'ru,en' : 'en',
          filter_entities: true,
          must_have_entities: true,
          limit: this.perSymbolLimit,
          published_after: from.toISOString(),
        },
      }),
    );

    const data = Array.isArray(response.data?.data) ? response.data.data : [];
    this.logger.debug(
      `${MARKETAUX_PROVIDER} returned ${data.length} articles for symbol=${asset.symbol}`,
    );

    return data.slice(0, this.perSymbolLimit);
  }

  private getMarketauxSymbols(asset: PortfolioNewsAsset): string[] {
    const symbol = asset.symbol.replace(/\.MOEX$/, '').replace(/\.ME$/, '');

    if (this.isLikelyRussianAsset(asset)) {
      return [...new Set([`${symbol}.ME`, symbol])];
    }

    return [symbol];
  }

  private toNewsArticleEntity(
    provider: NewsProviderName,
    symbol: string,
    item: FinnhubCompanyNewsItem | MarketauxNewsItem,
    fetchedAt: Date,
  ): Partial<NewsArticleEntity> {
    const normalizedItem = this.normalizeProviderNewsItem(provider, item, fetchedAt);
    const externalIdSource =
      normalizedItem.url ?? normalizedItem.title ?? normalizedItem.publishedAt.toISOString();
    const fallbackExternalId = createHash('sha256')
      .update(`${symbol}:${externalIdSource}`)
      .digest('hex');

    return {
      provider,
      symbol,
      externalId: normalizedItem.externalId ?? fallbackExternalId,
      title: this.truncate(normalizedItem.title || 'Untitled market news', 500),
      summary: normalizedItem.summary || null,
      url: normalizedItem.url || '',
      imageUrl: normalizedItem.imageUrl || null,
      source: this.truncate(normalizedItem.source || provider, 255),
      publishedAt: normalizedItem.publishedAt,
      fetchedAt,
    };
  }

  private normalizeProviderNewsItem(
    provider: NewsProviderName,
    item: FinnhubCompanyNewsItem | MarketauxNewsItem,
    fetchedAt: Date,
  ) {
    if (provider === FINNHUB_PROVIDER) {
      const finnhubItem = item as FinnhubCompanyNewsItem;

      return {
        externalId: finnhubItem.id ? String(finnhubItem.id) : undefined,
        title: finnhubItem.headline?.trim(),
        summary: finnhubItem.summary?.trim(),
        url: finnhubItem.url?.trim(),
        imageUrl: finnhubItem.image?.trim(),
        source: finnhubItem.source?.trim(),
        publishedAt: finnhubItem.datetime ? new Date(finnhubItem.datetime * 1000) : fetchedAt,
      };
    }

    const marketauxItem = item as MarketauxNewsItem;
    const source =
      typeof marketauxItem.source === 'string'
        ? marketauxItem.source
        : marketauxItem.source?.name || marketauxItem.source?.domain;

    return {
      externalId: marketauxItem.uuid,
      title: marketauxItem.title?.trim(),
      summary: (marketauxItem.description || marketauxItem.snippet)?.trim(),
      url: marketauxItem.url?.trim(),
      imageUrl: marketauxItem.image_url?.trim(),
      source: source?.trim(),
      publishedAt: marketauxItem.published_at ? new Date(marketauxItem.published_at) : fetchedAt,
    };
  }

  private async getCachedNews(
    provider: NewsProviderName,
    symbols: string[],
  ): Promise<NewsArticleEntity[]> {
    const since = subDays(new Date(), this.lookbackDays);
    this.logger.debug(
      `Loading cached news for provider=${provider}, symbols=${symbols.join(', ')}, since=${since.toISOString()}`,
    );
    const articles = await this.newsArticleRepo.find({
      where: {
        provider,
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
