import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '@/modules';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>,
  ) {}
}
