import { SetMetadata } from '@nestjs/common';

export const TRANSACTIONAL_KEY = 'isTransactional';

export function Transactional(): MethodDecorator {
  return SetMetadata(TRANSACTIONAL_KEY, true);
}
