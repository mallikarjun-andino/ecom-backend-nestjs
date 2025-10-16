import { AsyncLocalStorage } from 'async_hooks';

import { EntityManager } from 'typeorm';

interface TransactionContextData {
  entityManager: EntityManager;
}

class TransactionContext {
  private static als = new AsyncLocalStorage<TransactionContextData>();

  static run<T>(
    entityManager: EntityManager,
    fn: () => Promise<T>,
  ): Promise<T> {
    return TransactionContext.als.run({ entityManager }, fn);
  }

  protected get entityManager(): EntityManager {
    const context = TransactionContext.als.getStore();
    if (!context) {
      throw new Error('No transaction context available');
    }
    return context.entityManager;
  }
}

export { TransactionContext };
