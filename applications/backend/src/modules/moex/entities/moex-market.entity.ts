import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('moex_markets')
@Unique(['engineName', 'name'])
@Index(['engineName'])
export class MoexMarketEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'moex_id', type: 'integer' })
  moexId: number;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'title', type: 'varchar' })
  title: string;

  @Column({ name: 'engine_name', type: 'varchar' })
  engineName!: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
