import { EntityManager } from 'typeorm';

import { Category } from 'src/common/entities';

export interface CreateCategoryData {
  category_name: string;
}

export interface ICategoryCommandDao {
  createCategory(
    entityManager: EntityManager,
    body: CreateCategoryData,
  ): Promise<Category | null>;

  updateCategory(
    entityManager: EntityManager,
    category_id: string,
    category_name: string,
  ): Promise<Category | null>;

  deleteCategory(
    entityManager: EntityManager,
    category_id: string,
  ): Promise<void>;

  findCategoryById(
    entityManager: EntityManager,
    category_id: string,
  ): Promise<Category | null>;
}
