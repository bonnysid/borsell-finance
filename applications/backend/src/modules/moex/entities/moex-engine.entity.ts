import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('moex_engines')
@Index(['name'], { unique: true })
export class MoexEngineEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'moex_id', type: 'integer' })
  moexId: number;

  @Column({ name: 'name', type: 'varchar', unique: true })
  name: string;

  @Column({ name: 'title', type: 'varchar' })
  title: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
