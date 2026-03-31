import { QueryRunner } from 'typeorm'

import { permissionsArr } from '../role/role.fixtures.js'
import addPermission from './permission.fixture.js'

export const seedPermissions = async (queryRunner: QueryRunner) => {
    try {
        for (const permission of permissionsArr) {
            await addPermission(permission, queryRunner.manager)
        }
    } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : 'Unknown error'
        throw new Error(`Error while seeding permissions: ${errMessage}`)
    }
}
