import { EntityManager, Repository } from 'typeorm';

import { Product } from 'src/common/entities/product.entity';

import {
  AdjustStockData,
  CreateProductData,
  IProductCommandDao,
  UpdateProductData,
} from '../interface/product.command.dao.interface';

export class ProductCommandDao implements IProductCommandDao {
  private getrepo(entityManager: EntityManager): Repository<Product> {
    return entityManager.getRepository(Product);
  }

  async createProduct(
    entityManager: EntityManager,
    data: CreateProductData,
  ): Promise<Product> {
    const repo = this.getrepo(entityManager);
    const product = repo.create({
      product_name: data.product_name,
      category_id: data.category_id,
      price: data.price,
      stock: data.stock,
      rating: data.rating,
      image: data.image,
      description: data.description,
      is_active: data.is_active,
    });
    return repo.save(product);
  }

  async updateProduct(
    entityManager: EntityManager,
    product_id: string,
    data: UpdateProductData,
  ): Promise<Product | null> {
    const repo = this.getrepo(entityManager);
    await repo.update(
      { product_id },
      {
        product_name: data.product_name,
        category_id: data.category_id,
        price: data.price,
        stock: data.stock,
        rating: data.rating,
        image: data.image,
        description: data.description,
        is_active: data.is_active,
      },
    );
    return repo.findOne({ where: { product_id } });
  }

  async patchProduct(
    entityManager: EntityManager,
    product_id: string,
    data: UpdateProductData,
  ): Promise<Product | null> {
    const repo = this.getrepo(entityManager);
    await repo.update({ product_id }, data);
    return repo.findOne({ where: { product_id } });
  }

  async deleteProduct(
    entityManager: EntityManager,
    product_id: string,
  ): Promise<void> {
    const repo = this.getrepo(entityManager);
    await repo.delete({ product_id });
  }

  async activateProduct(
    entityManager: EntityManager,
    product_id: string,
  ): Promise<void> {
    const repo = this.getrepo(entityManager);
    await repo.update({ product_id }, { is_active: true });
  }

  async deactivateProduct(
    entityManager: EntityManager,
    product_id: string,
  ): Promise<void> {
    const repo = this.getrepo(entityManager);
    await repo.update({ product_id }, { is_active: false });
  }

  async adjustProductStock(
    entityManager: EntityManager,
    product_id: string,
    data: AdjustStockData,
  ): Promise<void> {
    const repo = this.getrepo(entityManager);
    await repo.increment({ product_id }, 'stock', data.adjustment);
  }

  async findProductById(
    entityManager: EntityManager,
    product_id: string,
  ): Promise<Product | null> {
    const repo = this.getrepo(entityManager);
    return repo.findOne({ where: { product_id } });
  }
}
