import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { SettingsService } from '@/modules/settings';
import { ChangePasswordDto } from '@/modules/user/dto/change-password.dto';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';
import { UserEntity } from '@/modules/user/entities';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly settingsService: SettingsService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const candidate = await this.findOne(createUserDto.username);

    if (candidate) {
      throw new BadRequestException('Something went wrong');
    }

    const baseCurrency = await this.settingsService.getBaseCurrencyCode();
    const newUser = this.usersRepository.create({
      username: createUserDto.username,
      passwordHash: bcrypt.hashSync(createUserDto.password, 10),
      currencyCode: baseCurrency,
    });

    return this.usersRepository.save(newUser);
  }

  async findOne(username: string) {
    return this.usersRepository.findOne({
      where: { username },
    });
  }

  async changePassword(username: string, dto: ChangePasswordDto) {
    const user = await this.findOne(username);

    if (!user) {
      throw new BadRequestException('Something went wrong');
    }

    const isValid = bcrypt.compareSync(dto.oldPassword, user.passwordHash);

    if (!isValid) {
      throw new BadRequestException('Неверный пароль');
    }

    user.passwordHash = bcrypt.hashSync(dto.newPassword, 10);

    return this.usersRepository.save(user);
  }
}
