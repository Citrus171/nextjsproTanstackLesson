import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('stripe_events')
export class StripeEventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  eventId: string;

  @Column({ type: 'datetime' })
  processedAt: Date;
}
