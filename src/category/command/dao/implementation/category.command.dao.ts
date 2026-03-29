import { EntityManager, Repository } from 'typeorm';

import { Category } from 'src/common/entities';

import {
  CreateCategoryData,
  ICategoryCommandDao,
} from '../interface/category.command.dao.interface';

export class CategoryCommandDao implements ICategoryCommandDao {
  private getRepo(entityManager: EntityManager): Repository<Category> {
    return entityManager.getRepository(Category);
  }

  async createCategory(
    entityManager: EntityManager,
    body: CreateCategoryData,
  ): Promise<Category | null> {
    const repo = this.getRepo(entityManager);
    const category = repo.create({
      category_name: body.category_name,
    });

    return repo.save(category);
  }

  async updateCategory(
    entityManager: EntityManager,
    category_id: string,
    category_name: string,
  ): Promise<Category | null> {
    const repo = this.getRepo(entityManager);
    await repo.update({ category_id }, { category_name });
    return repo.findOne({ where: { category_id } });
  }

  async deleteCategory(
    entityManager: EntityManager,
    category_id: string,
  ): Promise<void> {
    const repo = this.getRepo(entityManager);
    await repo.delete({ category_id });
  }

  async findCategoryById(
    entityManager: EntityManager,
    category_id: string,
  ): Promise<Category | null> {
    const repo = this.getRepo(entityManager);
    const category = await repo.findOne({ where: { category_id } });

    return category;
  }
}
