import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AssetService } from '@/modules/asset/services';

import { AssetNewsAnalysisEntity, NewsSentiment } from '../entities/asset-news-analysis.entity';
import { AiService } from './ai.service';
import { NewsService, PortfolioNewsAsset } from './news.service';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_TEXT_LENGTH = 1000; // chars per article passed to LLM
const MAX_ARTICLES_IN_PROMPT = 10;

export type NewsAnalysisResult = {
  symbolKey: string;
  analysis: string;
  sentiment: NewsSentiment;
  newsCount: number;
  analyzedAt: Date;
  cached: boolean;
};

@Injectable()
export class NewsAnalysisService {
  private readonly logger = new Logger(NewsAnalysisService.name);

  constructor(
    private readonly newsService: NewsService,
    private readonly aiService: AiService,
    private readonly assetService: AssetService,
    @InjectRepository(AssetNewsAnalysisEntity)
    private readonly repo: Repository<AssetNewsAnalysisEntity>,
  ) {}

  async analyzeAssets(symbols: string[]): Promise<NewsAnalysisResult> {
    const symbolKey = this.buildSymbolKey(symbols);
    this.logger.log(`Analyzing assets: ${symbolKey}`);

    const cached = await this.repo.findOne({ where: { symbolKey } });

    if (cached && Date.now() - cached.analyzedAt.getTime() < CACHE_TTL_MS) {
      this.logger.log(`Cache hit for symbolKey=${symbolKey}`);
      return { ...this.toResult(cached), cached: true };
    }

    this.logger.log(`Cache miss for symbolKey=${symbolKey}, running analysis`);

    const enriched = await this.enrichSymbols(symbols);
    const articles = await this.newsService.getPortfolioNews(enriched);

    if (articles.length === 0) {
      const empty: NewsAnalysisResult = {
        symbolKey,
        analysis: 'Новостей по данным активам не найдено.',
        sentiment: 'neutral',
        newsCount: 0,
        analyzedAt: new Date(),
        cached: false,
      };
      await this.upsert(symbolKey, empty);
      return empty;
    }

    const prompt = this.buildPrompt(symbols, articles.slice(0, MAX_ARTICLES_IN_PROMPT));
    const raw = await this.aiService.generateResponse(prompt);

    const sentiment = this.extractSentiment(raw);
    const analysis = this.cleanAnalysis(raw);
    const analyzedAt = new Date();

    const result: NewsAnalysisResult = {
      symbolKey,
      analysis,
      sentiment,
      newsCount: articles.length,
      analyzedAt,
      cached: false,
    };

    await this.upsert(symbolKey, result);
    return result;
  }

  private async enrichSymbols(symbols: string[]): Promise<PortfolioNewsAsset[]> {
    const assets = await this.assetService.getAssetsPriceBatch(symbols);
    const assetMap = new Map(assets.map((a) => [a.symbol.toUpperCase(), a]));

    return symbols.map((symbol) => {
      const upper = symbol.toUpperCase();
      const asset = assetMap.get(upper);
      return {
        symbol: upper,
        currencyCode: asset?.currencyCode,
        // MOEX assets have moexSecurityId set
        source: asset?.moexSecurityId ? 'MOEX' : undefined,
      };
    });
  }

  private buildSymbolKey(symbols: string[]): string {
    return [...symbols]
      .map((s) => s.trim().toUpperCase())
      .sort()
      .join(',');
  }

  private buildPrompt(
    symbols: string[],
    articles: Awaited<ReturnType<NewsService['getPortfolioNews']>>,
  ): string {
    const articleBlocks = articles
      .map((a, i) => {
        const text = (a.summary || a.title || '').slice(0, MAX_TEXT_LENGTH);
        return `[${i + 1}] ${a.symbol} | ${a.publishedAt.toLocaleDateString('ru')} | ${a.title}\n${text}`;
      })
      .join('\n\n');

    return `Ты — финансовый аналитик. Проанализируй новостной фон по активам: ${symbols.join(', ')}.

Ниже приведены последние новости и публикации по этим активам:

${articleBlocks}

Задача:
1. Кратко опиши общий новостной фон (3-5 предложений на русском языке).
2. В самом конце ответа на отдельной строке укажи итоговый сентимент в формате:
SENTIMENT: positive
или SENTIMENT: neutral
или SENTIMENT: negative

Отвечай только на русском языке.`;
  }

  private extractSentiment(raw: string): NewsSentiment {
    const match = raw.match(/SENTIMENT:\s*(positive|neutral|negative)/i);
    if (!match) return 'neutral';
    return match[1].toLowerCase() as NewsSentiment;
  }

  private cleanAnalysis(raw: string): string {
    return raw.replace(/SENTIMENT:\s*(positive|neutral|negative)\s*$/im, '').trim();
  }

  private toResult(entity: AssetNewsAnalysisEntity): Omit<NewsAnalysisResult, 'cached'> {
    return {
      symbolKey: entity.symbolKey,
      analysis: entity.analysis,
      sentiment: entity.sentiment,
      newsCount: entity.newsCount,
      analyzedAt: entity.analyzedAt,
    };
  }

  private async upsert(symbolKey: string, result: Omit<NewsAnalysisResult, 'cached'>) {
    await this.repo.upsert(
      {
        symbolKey,
        analysis: result.analysis,
        sentiment: result.sentiment,
        newsCount: result.newsCount,
        analyzedAt: result.analyzedAt,
      },
      ['symbolKey'],
    );
  }
}
