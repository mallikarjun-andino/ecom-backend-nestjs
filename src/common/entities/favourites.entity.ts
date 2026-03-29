import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Product } from './product.entity'; // Make sure Product is imported
import { User } from './user.entity';

@Entity({ name: 'favourites' })
export class Favourites {
  @PrimaryGeneratedColumn('uuid')
  favourite_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationship with User
  @ManyToOne(() => User, (user) => user.favourites)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Relationship with Product - ADD THIS
  @ManyToOne(() => Product, (product) => product.favourites)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
