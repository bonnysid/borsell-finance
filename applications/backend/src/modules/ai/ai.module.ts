import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OllamaService } from '@/modules/ai/services/ollama.service';

import { ChatMessageEntity, ChatSessionEntity, NewsArticleEntity, NewsSymbolSyncEntity } from './entities';
import { AiService } from './services/ai.service';
import { NewsService } from './services/news.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([NewsArticleEntity, NewsSymbolSyncEntity, ChatSessionEntity, ChatMessageEntity]),
  ],
  providers: [AiService, NewsService, OllamaService],
  exports: [AiService, NewsService, OllamaService, TypeOrmModule],
})
export class AiModule {}
