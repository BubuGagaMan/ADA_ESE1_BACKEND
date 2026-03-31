import { Role } from '@db/entities/role/Role.entity.js'
import { User } from '@db/entities/user/User.entity.js'
import { FastifyRedis } from '@fastify/redis'
import { DataSource, EntityManager } from 'typeorm'
import { UpdateUserPayload } from '@services/types/servicePayloadTypes/user.service.payload.type.js'
import { findOneEntityBy } from '@services/utils/entityManagerOps.util.js'
import { getErrorReturn } from '@services/utils/getErrorReturn.util.js'

import bcrypt from 'bcrypt'

export class UserServices {
    constructor(
        private db: DataSource,
        private redis: FastifyRedis,
    ) {}

    registerUser = async (payload: { confirmationCode: string }) => {
        try {
            const redisKey = `confirmation:registration:${payload.confirmationCode}`
            const redisValue = await this.redis.get(redisKey)

            if (!redisValue)
                throw new Error('Register confirmation code is invalid or expired', {
                    cause: {
                        status: 400,
                    },
                })

            const userData: {
                username: string
                email: string
                password: string
            } = JSON.parse(redisValue)

            const savedUser = await this.db.transaction(async (manager: EntityManager): Promise<User> => {
                const userRepo = manager.getRepository(User)

                const existing = await userRepo.findOneBy([{ email: userData.email }, { username: userData.username }])
                if (existing)
                    throw new Error('User already exists', {
                        cause: {
                            status: 409,
                        },
                    })

                const baseRole = await manager.findOneBy(Role, { name: process.env.DB_BASE_USER_ROLE || 'BASE_ROLE' })
                if (!baseRole)
                    throw new Error('Default role not found - DID YOU FORGET TO SEED THE DATABASE ?', {
                        cause: {
                            status: 404,
                        },
                    })
                const newUser = manager.create(User, {
                    ...userData,
                    roles: [baseRole],
                }) as User

                return await userRepo.save(newUser)
            })

            await this.redis.del(redisKey)

            return {
                data: savedUser,
                status: 201,
                message: 'User registered successfully.',
            }
        } catch (err) {
            const status = (err instanceof Error && (err.cause as any)?.status) || 500
            return {
                data: null,
                message: err instanceof Error ? err.message : 'Unkown error occurred',
                status,
            }
        }
    }

    updateUserById = async (payload: UpdateUserPayload) => {
        const { confirmationType, userId, confirmationCode } = payload

        try {
            const redisKey = `confirmation:${confirmationType.split(' ').join('_')}:${confirmationCode}`

            const redisValue = await this.redis.get(redisKey)

            if (!redisValue) {
                throw new Error('Register confirmation code is invalid or expired', {
                    cause: {
                        status: 400,
                    },
                })
            }

            const updatedUserData: {
                username?: string
                email?: string
                password?: string
            } = JSON.parse(redisValue)

            const user = await this.db.manager.findOne(User, {
                where: { id: userId },
                relations: { roles: true, userMetrics: true },
            })

            if (!user) {
                throw new Error('User not found', {
                    cause: {
                        status: 404,
                    },
                })
            }

            Object.assign(user, updatedUserData)

            const userProfile = {
                ...user,
                roles: user.roles.map((role: Role) => role.name),
            }

            // remove password
            const { password: pw, ...cacheData } = userProfile
            const redisKeyToDelete = `user:profile:${user.id}`

            await this.redis.set(
                redisKeyToDelete,
                JSON.stringify(cacheData),
                'EX',
                process.env.USER_SESSION_EXPIRATION || 900,
            )

            await this.db.manager.save(User, user)

            await this.redis.del(redisKey)

            return {
                data: user,
                message: 'Successfully updated user',
                status: 200,
            }
        } catch (err) {
            return getErrorReturn(err, 'Unknown error while attempting to update user')
        }
    }

    removeUserById = async (payload: { userId: string }) => {
        const { userId } = payload

        try {
            const user = await findOneEntityBy(this.db.manager, User, { id: userId }, 'User')

            await this.db.manager.remove(User, user)

            return {
                status: 204,
            }
        } catch (err) {
            return getErrorReturn(err, 'Unknown error while attempting to remove user')
        }
    }

    resetPassword = async (payload: { confirmationCode: string; password: string }) => {
        const { confirmationCode, password } = payload
        const redisKey = `confirmation:forgotten_password:${confirmationCode}`

        try {
            const redisValue = await this.redis.get(redisKey)

            if (!redisValue)
                throw new Error('Register confirmation code is invalid or expired', {
                    cause: {
                        status: 400,
                    },
                })

            const user = await findOneEntityBy(this.db.manager, User, JSON.parse(redisValue), 'User')

            // MAKE SURE THERE IS A SALT ROUND ENV!!! 1 is the default for testing speeds
            user.password = await bcrypt.hash(password, Number(process.env.PASSWORD_SALT_ROUNDS) || 1)

            await this.db.manager.save(User, user)

            await this.redis.del(redisKey)

            return {
                status: 200,
                message: 'Password reset successfully',
                redisKey, // send if failure occurs in controller - clean up there
            }
        } catch (err) {
            await this.redis.del(redisKey)
            const status = (err instanceof Error && (err.cause as any)?.status) || 500
            return {
                message: err instanceof Error ? err.message : 'Unkown erorr while attempting to reset password',
                status,
                redisKey: '',
            }
        }
    }

    editProfileImage = async (payload: { profile_image_url: string; userId: string }) => {
        const { profile_image_url, userId } = payload

        try {
            const user = await findOneEntityBy(this.db.manager, User, { id: userId }, 'user')

            user.profile_image_url = profile_image_url

            await this.db.manager.save(User, user)

            return {
                data: user,
                status: 200,
                message: 'Successfully edited user profile image',
            }
        } catch (err) {
            return getErrorReturn(err, 'Unkown error while attempting to edit profile image')
        }
    }
}
