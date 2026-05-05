import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('moex_boards')
@Unique(['engineName', 'marketName', 'boardId'])
@Index(['engineName', 'marketName'])
@Index(['boardId'])
export class MoexBoardEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'moex_id', type: 'integer' })
  moexId: number;

  @Column({ name: 'engine_name', type: 'varchar' })
  engineName!: string;

  @Column({ name: 'market_name', type: 'varchar' })
  marketName!: string;

  @Column({ name: 'board_id', type: 'varchar' })
  boardId!: string;

  @Column({ name: 'board_group_id', type: 'integer', nullable: true })
  boardGroupId?: number | null;

  @Column({ name: 'title', type: 'varchar', length: 255, nullable: true })
  title?: string | null;

  @Column({ name: 'is_traded', type: 'boolean', nullable: true })
  isTraded?: boolean | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
