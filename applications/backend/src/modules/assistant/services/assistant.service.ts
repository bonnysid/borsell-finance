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
    sessionId?: string,
  ): Promise<{ response: string; sessionId: string }> {
    let session = sessionId ? await this.chatService.getSession(sessionId) : null;

    if (!session || session.userId !== userId) {
      session = await this.chatService.createSession(userId, question);
    }

    await this.chatService.saveMessage(session.id, userId, 'user', question);

    const portfolioInsight = await this.portfolioService.getPortfolioInsight(userId, currencyCode);
    const allocation = await this.portfolioService.getPortfolioAllocation(userId, currencyCode);

    const system = portfolioInsight && allocation
      ? this.buildSystemContext(portfolioInsight, allocation.items, currencyCode)
      : 'You are a helpful financial assistant. Answer the user\'s questions about investments.';

    const history = await this.chatService.getMessages(session.id);
    const messages: Message[] = history.map((m) => ({ role: m.role, content: m.content }));

    const response = await this.aiService.chatWithHistory(messages, system);

    await this.chatService.saveMessage(session.id, userId, 'assistant', response);

    return { response, sessionId: session.id };
  }

  async getNewsDigest(userId: string, currencyCode: CurrencyCode): Promise<string> {
    const allocation = await this.portfolioService.getPortfolioAllocation(userId, currencyCode);

    if (!allocation || allocation.items.length === 0) {
      return 'You have no assets in your portfolio.';
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
      return 'No news found for your assets.';
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
        return `- [Weight in portfolio: ${weight.toFixed(1)}%] ${n.title} (Source: ${n.publisher}, Asset: ${n.symbol}, Published: ${n.publishedAt.toISOString()})`;
      })
      .join('\n');

    const prompt = `Summarize the following news for my portfolio assets. I have provided the weight of each asset in my portfolio to help you prioritize important news. Tell me if there are any major risks or opportunities for my specific portfolio. Keep it concise.\n\nNews:\n${newsContext}`;

    return this.aiService.generateResponse(prompt);
  }

  private buildSystemContext(
    insight: Awaited<ReturnType<PortfolioService['getPortfolioInsight']>>,
    allocationItems: Array<{ name: string; symbol: string; percentage: number; value: number }>,
    currencyCode: string,
  ): string {
    const assetsList = allocationItems
      .map(
        (item) =>
          `- ${item.name} (${item.symbol}): ${item.percentage.toFixed(2)}% доли, стоимость: ${item.value.toFixed(2)} ${currencyCode}`,
      )
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
}
