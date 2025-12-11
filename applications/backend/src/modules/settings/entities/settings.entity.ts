import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export enum SettingKey {
  BASE_CURRENCY_CODE = 'base_currency_code',
}

@Entity('settings')
export class SettingsEntity {
  @PrimaryColumn({ type: 'varchar' })
  key: SettingKey;

  @Column({ type: 'text' })
  value: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
