import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private repo: Repository<RefreshToken>,
  ) {}

  async create(userId: string, token: string, expiresAt: Date) {
    const tokenHash = await bcrypt.hash(token, 10);

    const entity = this.repo.create({ user: { id: userId }, tokenHash, expiresAt });

    return this.repo.save(entity);
  }

  async findValidToken(userId: string, token: string) {
    const tokens = await this.repo.find({ where: { user: { id: userId } } });

    for (const dbToken of tokens) {
      const isValid = await bcrypt.compare(token, dbToken.tokenHash);

      if (isValid) {
        return dbToken;
      }
    }

    return null;
  }

  async delete(id: string) {
    await this.repo.delete(id);
  }

  async deleteAllForUser(userId: string) {
    await this.repo.delete({ user: { id: userId } });
  }
}
