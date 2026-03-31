import { Role } from '@db/entities/role/Role.entity.js'
import { User } from '@db/entities/user/User.entity.js'
import { FastifyRedis } from '@fastify/redis'
import signJWT from '@utilities/signJWT.js'
import { FastifyInstance } from 'fastify'

export const cacheProfileAndSignJWT = async (user: User, requestServer: FastifyInstance, redis: FastifyRedis) => {
    // don't cache the password...

    const userProfile = {
        ...user,
        roles: user.roles.map((role: Role) => role.name),
    }
    // remove password
    const { password: pw, ...cacheData } = userProfile
    const redisKeyToDelete = `user:profile:${user.id}`

    await redis.set(redisKeyToDelete, JSON.stringify(cacheData), 'EX', process.env.USER_SESSION_EXPIRATION || 900)

    const JWT = signJWT(
        requestServer,
        {
            id: user.id,
            username: user.username,
            suspended: user.suspended,
            roles: user.roles,
        },
        `${Number(process.env.USER_SESSION_EXPIRATION)}s` || `${900}s`,
    )

    return {
        redisKeyToDelete,
        JWT,
    }
}
