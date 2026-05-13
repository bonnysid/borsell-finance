import { Injectable } from '@nestjs/common';
import { CurrencyCode } from '@packages/types';
import { Message } from 'ollama';

import { AiService } from '@/modules/ai/services/ai.service';
import { NewsService } from '@/modules/ai/services/news.service';
import { PortfolioService } from '@/modules/portfolio/services';

import { ChatService } from './chat.service';

@Injectable()
export class AssistantService {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly aiService: AiService,
    private readonly newsService: NewsService,
    private readonly chatService: ChatService,
  ) {}

  async askQuestion(
    userId: string,
    currencyCode: CurrencyCode,
    question: string,
    lang: string,
    sessionId?: string,
  ): Promise<{ response: string; sessionId: string }> {
    let session = sessionId ? await this.chatService.getSession(sessionId) : null;

    if (!session || session.userId !== userId) {
      session = await this.chatService.createSession(userId, question);
    }

    await this.chatService.saveMessage(session.id, userId, 'user', question);

    const portfolioInsight = await this.portfolioService.getPortfolioInsight(userId, currencyCode);
    const allocation = await this.portfolioService.getPortfolioAllocation(userId, currencyCode);
    const language = this.normalizeLanguage(lang);

    const system = portfolioInsight && allocation
      ? this.buildSystemContext(portfolioInsight, allocation.items, currencyCode, language)
      : this.buildFallbackSystem(language);

    const history = await this.chatService.getMessages(session.id);
    const messages: Message[] = history.map((m) => ({ role: m.role, content: m.content }));

    const response = await this.aiService.chatWithHistory(messages, system);

    await this.chatService.saveMessage(session.id, userId, 'assistant', response);

    return { response, sessionId: session.id };
  }

  async getNewsDigest(
    userId: string,
    currencyCode: CurrencyCode,
    lang: string,
    sessionId?: string,
  ): Promise<{ response: string; sessionId: string }> {
    const language = this.normalizeLanguage(lang);
    const triggerMessage = language === 'ru'
      ? 'Сводка новостей по портфелю'
      : 'Portfolio news digest';

    let session = sessionId ? await this.chatService.getSession(sessionId) : null;
    if (!session || session.userId !== userId) {
      session = await this.chatService.createSession(userId, triggerMessage);
    }

    await this.chatService.saveMessage(session.id, userId, 'user', triggerMessage);

    const allocation = await this.portfolioService.getPortfolioAllocation(userId, currencyCode);

    if (!allocation || allocation.items.length === 0) {
      const emptyResponse = language === 'ru'
        ? 'В вашем портфеле нет активов.'
        : 'You have no assets in your portfolio.';
      await this.chatService.saveMessage(session.id, userId, 'assistant', emptyResponse);
      return { response: emptyResponse, sessionId: session.id };
    }

    const portfolio = await this.portfolioService.findByUserId(userId);
    const assetsBySymbol = new Map(
      portfolio?.assets.map((portfolioAsset) => {
        const asset = portfolioAsset.userAsset.asset;
        return [asset.symbol, asset];
      }) ?? [],
    );
    const newsAssets = allocation.items.map((item) => {
      const asset = assetsBySymbol.get(item.symbol);
      return {
        symbol: item.symbol,
        name: item.name,
        currencyCode: asset?.currencyCode,
        source: asset?.metadata?.source,
      };
    });
    const news = await this.newsService.getPortfolioNews(newsAssets);

    if (news.length === 0) {
      const noNewsResponse = language === 'ru'
        ? 'Новостей по активам вашего портфеля не найдено.'
        : 'No news found for your assets.';
      await this.chatService.saveMessage(session.id, userId, 'assistant', noNewsResponse);
      return { response: noNewsResponse, sessionId: session.id };
    }

    const assetWeights = allocation.items.reduce(
      (acc, item) => {
        acc[item.symbol] = item.percentage;
        return acc;
      },
      {} as Record<string, number>,
    );

    const newsContext = news
      .slice(0, 15)
      .map((n) => {
        const weight = assetWeights[n.symbol] || 0;
        return `- [${n.symbol}, доля: ${weight.toFixed(1)}%] ${n.title} (${n.publisher}, ${n.publishedAt.toLocaleDateString('ru')})`;
      })
      .join('\n');

    const prompt = language === 'ru'
      ? `Ты финансовый аналитик. Сделай краткую сводку новостей по активам портфеля. Укажи ключевые риски и возможности. Отвечай на русском языке.\n\nНовости:\n${newsContext}`
      : `You are a financial analyst. Summarize the following portfolio news. Highlight key risks and opportunities. Be concise.\n\nNews:\n${newsContext}`;

    const response = await this.aiService.generateResponse(prompt);
    await this.chatService.saveMessage(session.id, userId, 'assistant', response);
    return { response, sessionId: session.id };
  }

  private normalizeLanguage(lang: string): string {
    return (lang || 'ru').split('-')[0].toLowerCase();
  }

  private buildFallbackSystem(language: string): string {
    return language === 'ru'
      ? 'Ты профессиональный финансовый ассистент. Отвечай на русском языке, будь конкретен и практичен.'
      : 'You are a professional financial assistant. Be concise and practical.';
  }

  private buildSystemContext(
    insight: Awaited<ReturnType<PortfolioService['getPortfolioInsight']>>,
    allocationItems: Array<{ name: string; symbol: string; percentage: number; value: number }>,
    currencyCode: string,
    language: string,
  ): string {
    if (language === 'ru') {
      const assetsList = allocationItems
        .map((item) => `- ${item.name} (${item.symbol}): ${item.percentage.toFixed(2)}%, стоимость: ${item.value.toFixed(2)} ${currencyCode}`)
        .join('\n');

      return `Ты профессиональный финансовый ассистент. Отвечай на русском языке, будь конкретен и практичен.

Данные портфеля пользователя:
- Рыночная стоимость: ${insight!.context.marketPrice} ${currencyCode}
- Себестоимость: ${insight!.context.costBasis} ${currencyCode}
- Общий PnL: ${insight!.context.totalPnl} ${currencyCode} (${insight!.context.totalPnlPercent.toFixed(1)}%)
- PnL за месяц: ${insight!.context.pnlMonthPercent.toFixed(1)}%
- Количество активов: ${insight!.context.assetsCount}
- Топ позиция: ${insight!.context.topPositionSymbol} (${insight!.context.topPositionPercent.toFixed(1)}% портфеля)
- Оценка здоровья: ${insight!.score}/100, статус: ${insight!.status}

Состав портфеля:
${assetsList}

Используй эти данные для ответа на вопросы пользователя. Если данных недостаточно — скажи об этом.`;
    }

    const assetsList = allocationItems
      .map((item) => `- ${item.name} (${item.symbol}): ${item.percentage.toFixed(2)}%, value: ${item.value.toFixed(2)} ${currencyCode}`)
      .join('\n');

    return `You are a professional financial assistant. Be concise and practical. Respond in English.

User portfolio data:
- Market value: ${insight!.context.marketPrice} ${currencyCode}
- Cost basis: ${insight!.context.costBasis} ${currencyCode}
- Total PnL: ${insight!.context.totalPnl} ${currencyCode} (${insight!.context.totalPnlPercent.toFixed(1)}%)
- Monthly PnL: ${insight!.context.pnlMonthPercent.toFixed(1)}%
- Number of assets: ${insight!.context.assetsCount}
- Top position: ${insight!.context.topPositionSymbol} (${insight!.context.topPositionPercent.toFixed(1)}% of portfolio)
- Health score: ${insight!.score}/100, status: ${insight!.status}

Portfolio composition:
${assetsList}

Use this data to answer user questions. If data is insufficient, say so.`;
  }
}
