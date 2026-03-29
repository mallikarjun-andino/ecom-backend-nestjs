import { EntityManager, Repository } from 'typeorm';

import { Category } from 'src/common/entities';

import { ICategoryQueryDao } from '../interface/category.query.dao.interface';

export class CategoryQuerryDao implements ICategoryQueryDao {
  private getRepo(entityManager: EntityManager): Repository<Category> {
    return entityManager.getRepository(Category);
  }

  async listCategories(
    entityManager: EntityManager,
  ): Promise<{ categories: Category[]; total: number }> {
    const repo = this.getRepo(entityManager);
    const categories = await repo.find();
    return {
      categories,
      total: categories.length,
    };
  }

  async getCategoryById(
    entityManager: EntityManager,
    category_id: string,
  ): Promise<Category | null> {
    const repo = this.getRepo(entityManager);
    return await repo.findOne({ where: { category_id } });
  }
}
