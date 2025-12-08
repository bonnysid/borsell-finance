import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PortfolioEntity } from './entities';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(PortfolioEntity)
    private readonly portfolioRepository: Repository<PortfolioEntity>,
  ) {}

  async findByUserId(userId: string) {
    return this.portfolioRepository.findOne({
      where: { userId },
    });
  }
}
