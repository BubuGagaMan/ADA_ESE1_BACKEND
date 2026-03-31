import { execSync } from 'child_process'

/**
 * SCRIPT FOR GENERATING A MIGRATION
 * Run by using the npm script + the name of your migration as a parameter:
 *
 * npm run migration:generate name-of-migration
 */
const name = process.argv[2]
if (!name) {
    console.error('Please provide a migration name! Example - npm run migration:generate my-migration-name')
    process.exit(1)
}

execSync(`npx typeorm-ts-node-esm migration:generate ./src/db/migrations/${name} -d ./src/db/data-source.ts`, {
    stdio: 'inherit',
})
