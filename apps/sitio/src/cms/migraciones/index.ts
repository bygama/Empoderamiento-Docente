import * as migration_20260915_201640_inicial from './20260915_201640_inicial';

export const migrations = [
  {
    up: migration_20260915_201640_inicial.up,
    down: migration_20260915_201640_inicial.down,
    name: '20260915_201640_inicial'
  },
];
