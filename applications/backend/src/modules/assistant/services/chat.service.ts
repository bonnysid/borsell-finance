import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChatMessageEntity } from '@/modules/ai/entities/chat-message.entity';
import { ChatSessionEntity } from '@/modules/ai/entities/chat-session.entity';

const HISTORY_LIMIT = 20;

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSessionEntity)
    private readonly sessionRepo: Repository<ChatSessionEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly messageRepo: Repository<ChatMessageEntity>,
  ) {}

  async createSession(userId: string, firstMessage: string): Promise<ChatSessionEntity> {
    const title = firstMessage.slice(0, 100).trim() || 'Новый чат';
    const session = this.sessionRepo.create({ userId, title });
    return this.sessionRepo.save(session);
  }

  async getSession(sessionId: string): Promise<ChatSessionEntity | null> {
    return this.sessionRepo.findOne({ where: { id: sessionId } });
  }

  async getSessions(userId: string): Promise<ChatSessionEntity[]> {
    return this.sessionRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
      take: 50,
    });
  }

  async deleteSession(sessionId: string, userId: string): Promise<void> {
    await this.sessionRepo.delete({ id: sessionId, userId });
    await this.messageRepo.delete({ sessionId });
  }

  async saveMessage(
    sessionId: string,
    userId: string,
    role: 'user' | 'assistant',
    content: string,
  ): Promise<ChatMessageEntity> {
    const message = this.messageRepo.create({ sessionId, userId, role, content });
    const saved = await this.messageRepo.save(message);
    await this.sessionRepo.update(sessionId, { updatedAt: new Date() });
    return saved;
  }

  async getMessages(sessionId: string): Promise<ChatMessageEntity[]> {
    return this.messageRepo.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
      take: HISTORY_LIMIT,
    });
  }
}
