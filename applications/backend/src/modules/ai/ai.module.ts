import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssetModule } from '@/modules/asset/asset.module';
import { OllamaService } from '@/modules/ai/services/ollama.service';

import { AiController } from './ai.controller';
import {
  AssetNewsAnalysisEntity,
  ChatMessageEntity,
  ChatSessionEntity,
  NewsArticleEntity,
  NewsSymbolSyncEntity,
} from './entities';
import { AiService } from './services/ai.service';
import { NewsAnalysisService } from './services/news-analysis.service';
import { NewsService } from './services/news.service';

@Module({
  imports: [
    AssetModule,
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([
      AssetNewsAnalysisEntity,
      ChatMessageEntity,
      ChatSessionEntity,
      NewsArticleEntity,
      NewsSymbolSyncEntity,
    ]),
  ],
  controllers: [AiController],
  providers: [AiService, NewsAnalysisService, NewsService, OllamaService],
  exports: [AiService, NewsAnalysisService, NewsService, OllamaService, TypeOrmModule],
})
export class AiModule {}
