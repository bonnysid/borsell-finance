import { Module } from '@nestjs/common';

import { PortfolioModule } from '@/modules/portfolio/portfolio.module';
import { UserModule } from '@/modules/user/user.module';
import { AiModule } from '@/modules/ai/ai.module';
import { UserAssetModule } from '@/modules/user-asset/user-asset.module';

import { AssistantController } from './assistant.controller';
import { AssistantService } from './services';

@Module({
  imports: [PortfolioModule, UserModule, AiModule, UserAssetModule],
  controllers: [AssistantController],
  providers: [AssistantService],
  exports: [AssistantService],
})
export class AssistantModule {}
