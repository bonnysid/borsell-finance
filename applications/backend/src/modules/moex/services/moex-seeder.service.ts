import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  MoexEngineEntity,
  MoexMarketEntity,
  MoexSecurityEntity,
  MoexTradeEntity,
} from '../entities';
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
    @InjectRepository(MoexSecurityEntity)
    private readonly securityRepository: Repository<MoexSecurityEntity>,
    @InjectRepository(MoexTradeEntity)
    private readonly tradeRepository: Repository<MoexTradeEntity>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed(forceRefresh = false): Promise<void> {
    const enginesCount = await this.engineRepository.count();

    if (enginesCount > 0) {
      this.logger.log('MOEX data already exists. Skipping initial seeding.');
      return;
    }

    this.logger.log('Starting MOEX seeding...');
    await this.seedEngines(forceRefresh);
    await this.seedMarkets(forceRefresh);
    await this.seedBoards(forceRefresh);
    await this.seedSecurities(forceRefresh);
    await this.seedTrades(forceRefresh);
    this.logger.log('MOEX seeding completed.');
  }

  private async seedEngines(forceRefresh = false) {
    this.logger.log('Seeding MOEX engines...');
    const engines = await this.moexService.getEngines(forceRefresh);
    this.logger.log(`Seeded ${engines.length} engines.`);
  }

  private async seedMarkets(forceRefresh = false) {
    this.logger.log('Seeding MOEX markets...');
    const engines = await this.engineRepository.find();
    let totalMarkets = 0;

    for (const engine of engines) {
      const markets = await this.moexService.getMarkets(engine.name, forceRefresh);

      totalMarkets += markets.length;
    }
    this.logger.log(`Seeded ${totalMarkets} markets.`);
  }

  private async seedBoards(forceRefresh = false) {
    this.logger.log('Seeding MOEX boards...');
    const markets = await this.marketRepository.find();
    let totalBoards = 0;

    for (const market of markets) {
      const boards = await this.moexService.getBoards(market.engineName, market.name, forceRefresh);

      totalBoards += boards.length;
    }
    this.logger.log(`Seeded ${totalBoards} boards.`);
  }

  private async seedSecurities(forceRefresh = false) {
    this.logger.log('Seeding MOEX securities...');
    const securities = await this.moexService.getSecurities(forceRefresh);
    this.logger.log(`Seeded ${securities.length} securities.`);
  }

  private async seedTrades(forceRefresh = false) {
    this.logger.log('Seeding MOEX trades...');
    const markets = await this.marketRepository.find();
    let totalTrades = 0;

    for (const market of markets) {
      const trades = await this.moexService.getTradesMarketData(
        market.engineName,
        market.name,
        forceRefresh,
      );

      totalTrades += trades.length;
    }
    this.logger.log(`Seeded ${totalTrades} trades.`);
  }
}
