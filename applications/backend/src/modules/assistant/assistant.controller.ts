import { Body, Controller, Delete, Get, Headers, Param, Post, UseGuards } from '@nestjs/common';

import { AuthGuard, CurrentUser } from '@/common';
import { UserJWT } from '@/express';
import { UserService } from '@/modules/user/user.service';

import { AskQuestionDto, DigestDto } from './dto';
import { AssistantService, ChatService } from './services';

@UseGuards(AuthGuard)
@Controller('assistant')
export class AssistantController {
  constructor(
    private readonly assistantService: AssistantService,
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  @Post('ask')
  async askQuestion(
    @CurrentUser() user: UserJWT,
    @Body() dto: AskQuestionDto,
    @Headers('accept-language') lang: string,
  ) {
    const dbUser = await this.userService.findOne(user.username);
    const currencyCode = dbUser?.currencyCode || 'USD';

    const result = await this.assistantService.askQuestion(
      user.userId,
      currencyCode,
      dto.question,
      lang,
      dto.sessionId,
    );
    return result;
  }

  @Post('digest')
  async getNewsDigest(
    @CurrentUser() user: UserJWT,
    @Body() dto: DigestDto,
    @Headers('accept-language') lang: string,
  ) {
    const dbUser = await this.userService.findOne(user.username);
    const currencyCode = dbUser?.currencyCode || 'USD';

    return this.assistantService.getNewsDigest(user.userId, currencyCode, lang, dto.sessionId);
  }

  @Get('sessions')
  async getSessions(@CurrentUser() user: UserJWT) {
    return this.chatService.getSessions(user.userId);
  }

  @Get('sessions/:sessionId/messages')
  async getMessages(@CurrentUser() user: UserJWT, @Param('sessionId') sessionId: string) {
    const session = await this.chatService.getSession(sessionId);
    if (!session || session.userId !== user.userId) {
      return [];
    }
    return this.chatService.getMessages(sessionId);
  }

  @Delete('sessions/:sessionId')
  async deleteSession(@CurrentUser() user: UserJWT, @Param('sessionId') sessionId: string) {
    await this.chatService.deleteSession(sessionId, user.userId);
    return { success: true };
  }
}
