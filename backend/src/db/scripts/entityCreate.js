import { execSync } from 'child_process'

/**
 * SCRIPT FOR CREATING AN ENTITY BOILERPLATE
 * Run by using the npm script + the name of your entity as a parameter:
 *
 * npm run entity:create NameOfEntity
 */
const name = process.argv[2]
if (!name) {
    console.error('Please provide an entity name! Example - npm run entity:create MyEntityName')
    process.exit(1)
}

execSync(`npx typeorm-ts-node-esm entity:create ./src/db/entities/${name}`, { stdio: 'inherit' })
