import { type FromTo } from 'cms-shared/types';

export type PropertyUpdate<T, P extends keyof T> = {
  property: P;
} & FromTo<T[P]>;
