import { User } from '@db/entities/user/User.entity.js'
import { Entity } from 'typeorm'

export const throwEntityNotFound = (entity: typeof Entity, message: string, status: number = 404) => {
    if (!entity) {
        throw new Error(message, { cause: { status } })
    }
}

export const throwRequestingUserNotFound = (user: User | null | undefined) => {
    if (!user) {
        throw new Error('Unauthorised - requesting user not found', {
            cause: {
                status: 401,
            },
        })
    }
}
