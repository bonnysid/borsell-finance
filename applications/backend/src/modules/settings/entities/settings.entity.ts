import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export enum SettingKey {
  BASE_CURRENCY_CODE = 'base_currency_code',
  LAST_TOP_TICKERS_SYNC_AT = 'last_top_tickers_sync_at',
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
