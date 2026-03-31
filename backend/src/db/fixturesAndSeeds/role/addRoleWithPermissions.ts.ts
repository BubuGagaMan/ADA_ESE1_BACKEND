import { EntityManager, In } from 'typeorm'
import { Role } from '@db/entities/role/Role.entity.js'
import { Permission } from '@db/entities/permission/Permission.entity.js'
import { RoleData } from './role.fixtures.js'

const addRoleWithPermissions = async (roleData: RoleData, manager: EntityManager) => {
    const permissions = await manager.findBy(Permission, {
        id: In(roleData.permissionIds),
    })

    const role = manager.create(Role, {
        id: roleData.id,
        name: roleData.name,
        permissions,
    })

    await manager.save(role)
}

export default addRoleWithPermissions
