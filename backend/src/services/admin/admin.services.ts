import { User } from '@db/entities/user/User.entity.js'
import { FastifyRedis } from '@fastify/redis'
import { findOneEntityBy } from '@services/utils/entityManagerOps.util.js'
import { getErrorReturn } from '@services/utils/getErrorReturn.util.js'
import { DataSource } from 'typeorm'
import sendSuspendStatusEmail from './sendSuspendStatusEmail.js'
import { FastifyRequest } from 'fastify'

export class AdminServices {
    constructor(
        private db: DataSource,
        private redis: FastifyRedis,
    ) {}

    swapUserSuspendedStatus = async (payload: {
        targetUserId: string
        requestingUserId: string
        message: string
        req: FastifyRequest
    }) => {
        const { targetUserId, requestingUserId, message, req } = payload

        if (targetUserId === requestingUserId) {
            return {
                data: null,
                status: 400,
                message: 'Self suspension is not allowed',
            }
        }
        try {
            const user = await findOneEntityBy(this.db.manager, User, { id: targetUserId }, 'User')

            user.suspended = !user.suspended

            await this.db.manager.save(User, user)

            // checking state after assigning...
            if (user.suspended) {
                await this.redis.set(`user:suspended:${user.id}`, 1)
            } else {
                await this.redis.del(`user:suspended:${user.id}`)
            }

            await sendSuspendStatusEmail(user.suspended, message, user.email, req)

            return {
                data: user,
                status: 200,
                message: 'User ban status successfully swapped',
            }
        } catch (err) {
            return getErrorReturn(err, 'Unknown error when attempting to ban user')
        }
    }
}
