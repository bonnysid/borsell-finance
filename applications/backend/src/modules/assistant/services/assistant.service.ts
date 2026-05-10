import { Injectable } from '@nestjs/common';
import { CurrencyCode } from '@packages/types';

import { AiService } from '@/modules/ai/services/ai.service';
import { NewsService } from '@/modules/ai/services/news.service';
import { PortfolioService } from '@/modules/portfolio/services';

@Injectable()
export class AssistantService {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly aiService: AiService,
    private readonly newsService: NewsService,
  ) {}

  async askQuestion(userId: string, currencyCode: CurrencyCode, question: string): Promise<string> {
    const portfolioInsight = await this.portfolioService.getPortfolioInsight(userId, currencyCode);
    const allocation = await this.portfolioService.getPortfolioAllocation(userId, currencyCode);

    if (!portfolioInsight || !allocation) {
      return 'No portfolio data available.';
    }

    const assetsList = allocation.items
      .map(
        (item) =>
          `- ${item.name} (${item.symbol}): ${item.percentage.toFixed(2)}% of portfolio, value: ${item.value.toFixed(2)} ${currencyCode}`,
      )
      .join('\n');

    const context = `
      User's Portfolio Summary:
      - Total Market Value: ${portfolioInsight.context.marketPrice} ${currencyCode}
      - Cost Basis: ${portfolioInsight.context.costBasis} ${currencyCode}
      - Total PnL: ${portfolioInsight.context.totalPnl} ${currencyCode} (${portfolioInsight.context.totalPnlPercent}%)
      - Assets Count: ${portfolioInsight.context.assetsCount}
      - Top Position: ${portfolioInsight.context.topPositionSymbol} (${portfolioInsight.context.topPositionPercent}%)
      - Portfolio Status: ${portfolioInsight.status}
      - System Recommendations: ${portfolioInsight.recommendations
        .map((recommendation) => recommendation.key)
        .join(', ')}

      Current Allocation:
      ${assetsList}

      Instructions:
      - Use the provided portfolio information to answer the user's question.
      - Be professional and helpful.
      - If you don't have enough information, say so.
    `;

    return this.aiService.generateResponse(question, context);
  }

  async getNewsDigest(userId: string, currencyCode: CurrencyCode): Promise<string> {
    const allocation = await this.portfolioService.getPortfolioAllocation(userId, currencyCode);

    if (!allocation || allocation.items.length === 0) {
      return 'You have no assets in your portfolio.';
    }

    const symbols = allocation.items.map((item) => item.symbol);
    const news = await this.newsService.getPortfolioNews(symbols);

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
}
