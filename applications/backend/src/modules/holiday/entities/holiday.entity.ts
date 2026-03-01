import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('holidays')
export class HolidayEntity {
  @PrimaryColumn({ type: 'date' })
  date: Date;

  @Column({ type: 'boolean' })
  isDayOff: boolean;
}
