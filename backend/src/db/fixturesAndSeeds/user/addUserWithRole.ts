import { EntityManager, In } from 'typeorm'
import { UserMetrics } from '@db/entities/user_metrics/UserMetrics.entity.js'
import { Role } from '@db/entities/role/Role.entity.js'
import { User } from '@db/entities/user/User.entity.js'
import { UserData } from './user.fixtures.js'

const addUserWithRole = async (userData: UserData, manager: EntityManager) => {
    const roles = await manager.findBy(Role, { name: In(userData.roleNames) })

    const user = manager.create(User, {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        password: userData.password,
        roles: roles,
        suspended: userData.suspended,
    })

    const metrics = manager.create(UserMetrics, {
        ...userData.metrics,
        user: user,
    })

    user.userMetrics = metrics
    await manager.save(user)
}

export default addUserWithRole
