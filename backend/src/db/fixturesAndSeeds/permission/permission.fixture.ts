import { EntityManager } from 'typeorm'
import { Permission } from '@db/entities/permission/Permission.entity.js'
import { PermissionData } from '../role/role.fixtures.js'

const addPermission = async (permissionData: PermissionData, manager: EntityManager) => {
    const permission = manager.create(Permission, {
        ...permissionData,
    })

    await manager.save(permission)
}

export default addPermission
