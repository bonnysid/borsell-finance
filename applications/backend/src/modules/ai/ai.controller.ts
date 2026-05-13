import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { AuthGuard } from '@/common';

import { NewsAnalysisService } from './services/news-analysis.service';

@UseGuards(AuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly newsAnalysisService: NewsAnalysisService) {}

  // GET /ai/news-analysis?symbols=AFKS,SBER,LKOH
  @Get('news-analysis')
  async getNewsAnalysis(@Query('symbols') symbolsParam: string) {
    const symbols = (symbolsParam || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (symbols.length === 0) {
      return { error: 'symbols query param is required' };
    }

    return this.newsAnalysisService.analyzeAssets(symbols);
  }
}
