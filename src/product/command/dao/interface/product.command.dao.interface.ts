import { EntityManager } from 'typeorm';

import { Product } from 'src/common/entities';

export interface CreateProductData {
  product_name: string;
  category_id: string;
  price: number;
  stock: number;
  rating?: number;
  image?: string[];
  description?: string;
  is_active: boolean;
}

export interface UpdateProductData {
  product_name: string;
  category_id: string;
  price: number;
  stock: number;
  rating?: number;
  image?: string[];
  description?: string;
  is_active: boolean;
}

export interface PatchProductData {
  product_name?: string;
  category_id?: string;
  price?: number;
  stock?: number;
  rating?: number;
  image?: string[];
  description?: string;
  is_active?: boolean;
}

export interface AdjustStockData {
  adjustment: number;
  reason?: string;
}

export interface IProductCommandDao {
  createProduct(
    entityManager: EntityManager,
    data: CreateProductData,
  ): Promise<Product>;

  updateProduct(
    entityManager: EntityManager,
    product_id: string,
    data: UpdateProductData,
  ): Promise<Product | null>;

  patchProduct(
    entityManager: EntityManager,
    product_id: string,
    data: PatchProductData,
  ): Promise<Product | null>;

  deleteProduct(
    entityManager: EntityManager,
    product_id: string,
  ): Promise<void>;

  activateProduct(
    entityManager: EntityManager,
    product_id: string,
  ): Promise<void>;

  deactivateProduct(
    entityManager: EntityManager,
    product_id: string,
  ): Promise<void>;

  adjustProductStock(
    entityManager: EntityManager,
    product_id: string,
    data: AdjustStockData,
  ): Promise<void>;

  findProductById(
    entityManager: EntityManager,
    product_id: string,
  ): Promise<Product | null>;
}
