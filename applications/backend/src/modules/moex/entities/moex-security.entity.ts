import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('moex_securities')
@Index(['secId'], { unique: true })
export class MoexSecurityEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'sec_id', type: 'varchar', length: 255 })
  secId!: string;

  @Column({ name: 'short_name', type: 'varchar', length: 255, nullable: true })
  shortName?: string | null;

  @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
  name?: string | null;

  @Column({ name: 'reg_number', type: 'varchar', length: 255, nullable: true })
  regNumber?: string | null;

  @Column({ name: 'isin', type: 'varchar', length: 255, nullable: true })
  isin?: string | null;

  @Column({ name: 'is_traded', type: 'boolean', nullable: true })
  isTraded?: boolean | null;

  @Column({ name: 'emitent_id', type: 'integer', nullable: true })
  emitentId?: number | null;

  @Column({ name: 'emitent_title', type: 'varchar', length: 255, nullable: true })
  emitentTitle?: string | null;

  @Column({ name: 'emitent_inn', type: 'varchar', length: 255, nullable: true })
  emitentInn?: string | null;

  @Column({ name: 'emitent_okpo', type: 'varchar', length: 255, nullable: true })
  emitentOkpo?: string | null;

  @Column({ name: 'type', type: 'varchar', length: 255, nullable: true })
  type?: string | null;

  @Column({ name: 'group', type: 'varchar', length: 255, nullable: true })
  group?: string | null;

  @Column({ name: 'primary_boardid', type: 'varchar', length: 255, nullable: true })
  primaryBoardId?: string | null;

  @Column({ name: 'marketprice_boardid', type: 'varchar', length: 255, nullable: true })
  marketPriceBoardId?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
