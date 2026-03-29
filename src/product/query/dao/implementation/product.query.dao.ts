import { EntityManager, Repository } from 'typeorm';

import { Product } from 'src/common/entities';

import {
  GetProductsByCategoryFilters,
  IProductQueryDao,
  ListProductsFilters,
} from '../interface/product.query.dao.interface';

export class ProductQueryDao implements IProductQueryDao {
  private getRepo(entityManager: EntityManager): Repository<Product> {
    return entityManager.getRepository(Product);
  }

  async getProductById(
    entityManager: EntityManager,
    product_id: string,
  ): Promise<Product | null> {
    const repo = this.getRepo(entityManager);
    return repo.findOne({
      where: { product_id },
      relations: ['category'],
    });
  }

  async listProducts(
    entityManager: EntityManager,
    filters: ListProductsFilters,
  ): Promise<{ products: Product[]; total: number }> {
    const repo = this.getRepo(entityManager);
    const qb = repo.createQueryBuilder('product');

    if (filters.category_id) {
      qb.andWhere('product.category_id = :category_id', {
        category_id: filters.category_id,
      });
    }
    if (filters.is_active !== undefined) {
      qb.andWhere('product.is_active = :is_active', {
        is_active: filters.is_active,
      });
    }
    if (filters.min_price !== undefined) {
      qb.andWhere('product.price >= :min_price', {
        min_price: filters.min_price,
      });
    }
    if (filters.max_price !== undefined) {
      qb.andWhere('product.price <= :max_price', {
        max_price: filters.max_price,
      });
    }
    if (filters.min_rating !== undefined) {
      qb.andWhere('product.rating >= :min_rating', {
        min_rating: filters.min_rating,
      });
    }
    if (filters.in_stock) {
      qb.andWhere('product.stock > 0');
    }

    qb.orderBy(
      `product.${filters.sort_by ?? 'created_at'}`,
      (filters.sort_order?.toUpperCase() as 'ASC' | 'DESC') ?? 'DESC',
    );

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    qb.skip((page - 1) * limit).take(limit);

    const [products, total] = await qb.getManyAndCount();
    return { products, total };
  }

  async getProductsByCategory(
    entityManager: EntityManager,
    category_id: string,
    filters: GetProductsByCategoryFilters,
  ): Promise<{ products: Product[]; total: number }> {
    const repo = this.getRepo(entityManager);
    const qb = repo
      .createQueryBuilder('product')
      .where('product.category_id = :category_id', { category_id });

    if (filters.is_active !== undefined) {
      qb.andWhere('product.is_active = :is_active', {
        is_active: filters.is_active,
      });
    }

    qb.orderBy(
      `product.${filters.sort_by ?? 'created_at'}`,
      (filters.sort_order?.toUpperCase() as 'ASC' | 'DESC') ?? 'DESC',
    );

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    qb.skip((page - 1) * limit).take(limit);

    const [products, total] = await qb.getManyAndCount();
    return { products, total };
  }
}
