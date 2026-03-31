import { execSync } from 'child_process'

/**
 * SCRIPT FOR REVERTING A MIGRATION
 * Run by using the npm script:
 *
 * npm run migration:revert
 *
 * reverts the last migration - can be used again to revert previous ones
 */

execSync(`npx typeorm-ts-node-esm migration:revert -d ./src/db/data-source.ts`, { stdio: 'inherit' })
