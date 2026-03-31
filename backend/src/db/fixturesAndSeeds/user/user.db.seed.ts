import { QueryRunner } from 'typeorm'
import { usersArr } from './user.fixtures.js'
import addUserWithRole from './addUserWithRole.js'

export const seedUsers = async (queryRunner: QueryRunner) => {
    try {
        for (const user of usersArr) {
            await addUserWithRole(user, queryRunner.manager)
        }
    } catch (err) {
        throw new Error(`Error seeding users: ${err instanceof Error ? err.message : 'Unknown'}`)
    }
}
