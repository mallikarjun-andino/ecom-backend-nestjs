import { EntityManager } from 'typeorm/entity-manager/EntityManager';

import { Product } from 'src/common/entities';

export interface ListProductsFilters {
  category_id?: string;
  is_active?: boolean;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  in_stock?: boolean;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  limit?: number;
}

export interface GetProductsByCategoryFilters {
  is_active?: boolean;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  limit?: number;
}

export interface IProductQueryDao {
  listProducts(
    entityManager: EntityManager,
    filters: ListProductsFilters,
  ): Promise<{ products: Product[]; total: number }>;

  getProductsByCategory(
    entityManager: EntityManager,
    category_id: string,
    filters: GetProductsByCategoryFilters,
  ): Promise<{ products: Product[]; total: number }>;

  getProductById(
    entityManager: EntityManager,
    product_id: string,
  ): Promise<Product | null>;
}
