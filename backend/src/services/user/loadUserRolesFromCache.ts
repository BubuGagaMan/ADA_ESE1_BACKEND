import { FastifyRedis } from '@fastify/redis'
import UserRole from '../../types/UserRole.js'

// ONLY USE WHERE USER IS AUTHENTICATED AND ROLES ARE CACHED IN PROFILE!!!
const loadUserRolesFromCache = async (userId: string, redis: FastifyRedis) => {
    const userProfileJSON = await redis.get(`user:profile:${userId}`)

    if (!userProfileJSON) {
        return false
    }

    const userProfile = JSON.parse(userProfileJSON)

    const userRoles = userProfile.roles

    return userRoles as UserRole[]
}

export default loadUserRolesFromCache
