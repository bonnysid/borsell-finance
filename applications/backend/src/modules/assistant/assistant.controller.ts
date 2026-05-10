import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { AuthGuard, CurrentUser } from '@/common';
import { UserJWT } from '@/express';
import { UserService } from '@/modules/user/user.service';

import { AskQuestionDto } from './dto';
import { AssistantService } from './services';

@UseGuards(AuthGuard)
@Controller('assistant')
export class AssistantController {
  constructor(
    private readonly assistantService: AssistantService,
    private readonly userService: UserService,
  ) {}

  @Post('ask')
  async askQuestion(@CurrentUser() user: UserJWT, @Body() dto: AskQuestionDto) {
    const dbUser = await this.userService.findOne(user.username);
    const currencyCode = dbUser?.currencyCode || 'USD';

    const response = await this.assistantService.askQuestion(
      user.userId,
      currencyCode,
      dto.question,
    );
    return { response };
  }

  @Post('digest')
  async getNewsDigest(@CurrentUser() user: UserJWT) {
    const dbUser = await this.userService.findOne(user.username);
    const currencyCode = dbUser?.currencyCode || 'USD';

    const response = await this.assistantService.getNewsDigest(user.userId, currencyCode);
    return { response };
  }
}
