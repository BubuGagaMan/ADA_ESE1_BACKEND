import { QueryRunner } from 'typeorm'
import { rolesArr } from './role.fixtures.js'
import addRoleWithPermissions from './addRoleWithPermissions.ts.js'

export const seedRoles = async (queryRunner: QueryRunner) => {
    try {
        for (const role of rolesArr) {
            await addRoleWithPermissions(role, queryRunner.manager)
        }
    } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : 'Unknown error'
        throw new Error(`Error while seeding roles: ${errMessage}`)
    }
}
