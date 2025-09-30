import { defineConfig } from 'bun';

export default defineConfig({
  test: {
    root: './tests',
    preload: ['./tests/helpers/setup.ts'],
    coverage: {
      enabled: true,
      threshold: {
        line: 80,
        function: 80,
        branch: 80,
        statement: 80,
      },
      exclude: [
        'src/index.ts',
        'src/scripts/**',
        'src/db/connectionDB.ts',
        'tests/**',
        'node_modules/**',
      ],
    },
  },
});