import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('store_settings')
export class StoreSettingsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, type: 'varchar' })
  invoiceNumber: string | null;

  @Column({ type: 'int' })
  shippingFixedFee: number;

  @Column({ type: 'int' })
  shippingFreeThreshold: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
