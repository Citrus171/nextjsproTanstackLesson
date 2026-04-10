import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'int' })
  parentId: number | null;

  @ManyToOne(() => CategoryEntity, (cat) => cat.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: CategoryEntity | null;

  @OneToMany(() => CategoryEntity, (cat) => cat.parent)
  children: CategoryEntity[];

  @CreateDateColumn()
  createdAt: Date;
}
