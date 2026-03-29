import { EntityManager } from 'typeorm';

import { Category } from 'src/common/entities';

export interface ListCategoriesFilters {
  category_name?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  limit?: number;
}

export interface ICategoryQueryDao {
  listCategories(
    entityManager: EntityManager,
  ): Promise<{ categories: Category[]; total: number }>;

  getCategoryById(
    entityManager: EntityManager,
    category_id: string,
  ): Promise<Category | null>;
}
