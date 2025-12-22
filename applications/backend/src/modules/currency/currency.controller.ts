import { Controller, Get } from '@nestjs/common';

import { CurrencyDto } from '@/modules/currency/dto';
import { CurrencyService } from '@/modules/currency/services';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('/all')
  async getAllCurrencies() {
    const data = await this.currencyService.getAllCurrencies();

    return data.map((it) => new CurrencyDto(it));
  }
}
