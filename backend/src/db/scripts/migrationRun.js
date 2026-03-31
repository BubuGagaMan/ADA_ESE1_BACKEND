import { execSync } from 'child_process'

/**
 * SCRIPT FOR RUNNING ALL MIGRATIONS
 * Run by using the npm script:
 *
 * npm run migration:run
 */

execSync(`npx typeorm-ts-node-esm migration:run -d ./src/db/data-source.ts`, { stdio: 'inherit' })
