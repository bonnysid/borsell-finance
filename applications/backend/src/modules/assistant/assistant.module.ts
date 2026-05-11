import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatMessageEntity } from '@/modules/ai/entities/chat-message.entity';
import { ChatSessionEntity } from '@/modules/ai/entities/chat-session.entity';
import { PortfolioModule } from '@/modules/portfolio/portfolio.module';
import { UserModule } from '@/modules/user/user.module';
import { AiModule } from '@/modules/ai/ai.module';
import { UserAssetModule } from '@/modules/user-asset/user-asset.module';

import { AssistantController } from './assistant.controller';
import { AssistantService, ChatService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatSessionEntity, ChatMessageEntity]),
    PortfolioModule,
    UserModule,
    AiModule,
    UserAssetModule,
  ],
  controllers: [AssistantController],
  providers: [AssistantService, ChatService],
  exports: [AssistantService, ChatService],
})
export class AssistantModule {}
