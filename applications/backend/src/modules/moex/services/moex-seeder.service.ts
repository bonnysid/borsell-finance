import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MoexBoardEntity, MoexEngineEntity, MoexMarketEntity } from '../entities';
import { MoexService } from './moex.service';

@Injectable()
export class MoexSeederService implements OnModuleInit {
  private readonly logger = new Logger(MoexSeederService.name);

  constructor(
    private readonly moexService: MoexService,
    @InjectRepository(MoexEngineEntity)
    private readonly engineRepository: Repository<MoexEngineEntity>,
    @InjectRepository(MoexMarketEntity)
    private readonly marketRepository: Repository<MoexMarketEntity>,
    @InjectRepository(MoexBoardEntity)
    private readonly boardRepository: Repository<MoexBoardEntity>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    const enginesCount = await this.engineRepository.count();

    if (enginesCount > 0) {
      this.logger.log('MOEX data already exists. Skipping initial seeding.');
      return;
    }

    this.logger.log('Starting MOEX seeding...');
    await this.seedEngines();
    await this.seedMarkets();
    await this.seedBoards();
    this.logger.log('MOEX seeding completed.');
  }

  private async seedEngines() {
    this.logger.log('Seeding MOEX engines...');
    const { engines } = await this.moexService.getEngines();

    for (const engine of engines) {
      await this.engineRepository.upsert(
        {
          moexId: engine.id,
          name: engine.name,
          title: engine.title,
        },
        ['name'],
      );
    }
    this.logger.log(`Seeded ${engines.length} engines.`);
  }

  private async seedMarkets() {
    this.logger.log('Seeding MOEX markets...');
    const engines = await this.engineRepository.find();
    let totalMarkets = 0;

    for (const engine of engines) {
      const { markets } = await this.moexService.getMarkets(engine.name);

      for (const market of markets) {
        await this.marketRepository.upsert(
          {
            moexId: market.id,
            name: market.NAME,
            title: market.title,
            engineName: engine.name,
          },
          ['engineName', 'name'],
        );
        totalMarkets++;
      }
    }
    this.logger.log(`Seeded ${totalMarkets} markets.`);
  }

  private async seedBoards() {
    this.logger.log('Seeding MOEX boards...');
    const markets = await this.marketRepository.find();
    let totalBoards = 0;

    for (const market of markets) {
      const { boards } = await this.moexService.getBoards(market.engineName, market.name);

      for (const board of boards) {
        await this.boardRepository.upsert(
          {
            engineName: market.engineName,
            marketName: market.name,
            boardId: board.boardid,
            boardGroupId: board.board_group_id,
            title: board.title,
            isTraded: board.is_traded === 1,
          },
          ['engineName', 'marketName', 'boardId'],
        );
        totalBoards++;
      }
    }
    this.logger.log(`Seeded ${totalBoards} boards.`);
  }
}
