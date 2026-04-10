import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { OrderItemEntity } from './order-item.entity';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface ShippingAddress {
  zip: string;
  prefecture: string;
  city: string;
  address1: string;
  address2?: string;
}

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'],
  })
  status: OrderStatus;

  @Column({ type: 'json' })
  shippingAddress: ShippingAddress;

  @Column({ type: 'int' })
  shippingFee: number;

  @Column({ type: 'int' })
  totalAmount: number;

  @Column({ nullable: true, type: 'varchar' })
  stripeSessionId: string | null;

  @OneToMany(() => OrderItemEntity, (item) => item.order)
  items: OrderItemEntity[];

  @CreateDateColumn()
  createdAt: Date;
}
