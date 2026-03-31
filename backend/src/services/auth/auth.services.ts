import { FastifyRedis } from '@fastify/redis'
import { DataSource } from 'typeorm'
import sendConfirmationCodeEmail from './emailConfirmation/sendConfirmationCodeEmail.js'
import { EmailConfirmationEnum } from './emailConfirmation/emailConfirmationTypes.js'
import { cacheConfirmation } from './emailConfirmation/cacheConfirmation.js'
import {
    checkMultipleExistingUserDetails,
    checkSingleExistingUserDetails,
} from './emailConfirmation/emailConfirmationOperations.js'
import bcrypt from 'bcrypt'
import {
    RegistrationConfirmationEmailPayload,
    UserDetailsChangeConfirmationPayload,
} from '@services/types/servicePayloadTypes/auth.service.payload.type.js'
import { User } from '@db/entities/user/User.entity.js'
import { findOneEntityBy } from '@services/utils/entityManagerOps.util.js'
import { generateRandom6CharCode } from '@services/utils/random6CharCode.js'
import { FastifyRequest } from 'fastify'
import isPasswordCorrect from '@tests/functions/isPasswordCorrect.js'
import generateSecret from '@utilities/generateSecret.js'
import { cacheProfileAndSignJWT } from './cacheProfileAndSignJWT.js'
import { getErrorReturn } from '@services/utils/getErrorReturn.util.js'

export class AuthServices {
    #refreshTokenPrefix: string
    constructor(
        private db: DataSource,
        private redis: FastifyRedis,
    ) {
        this.#refreshTokenPrefix = 'refreshToken:'
    }

    login = async (payload: {
        username: string
        password: string
        req: FastifyRequest
    }): Promise<{
        data: { accessToken: string; refreshToken: string } | null
        message: string
        status: number
        redisKeysToDelete?: string[]
    }> => {
        const redisKey = ''
        const newRefreshTokenSecret = generateSecret()
        const refreshTokenKey = `${this.#refreshTokenPrefix}${newRefreshTokenSecret}`
        try {
            const { username, password, req } = payload
            const existingUser = await this.db.manager.findOne(User, {
                where: { username },
                relations: {
                    roles: true,
                    userMetrics: true,
                },
            })

            if (!existingUser) throw new Error('User with given username does not exist.', { cause: { status: 404 } })

            if (existingUser.suspended) {
                throw new Error('Account suspended', { cause: { status: 403 } })
            }

            const isPWcorrect = await isPasswordCorrect(password, existingUser.password)

            if (!isPWcorrect) throw new Error('Unauthorised - incorrect password.', { cause: { status: 401 } })

            await this.redis.set(
                refreshTokenKey,
                existingUser.id,
                'EX',
                process.env.USER_REFRESH_TOKEN_EXPIRATION || 604800,
            )

            const { JWT, redisKeyToDelete } = await cacheProfileAndSignJWT(existingUser, req.server, this.redis)

            return {
                data: { accessToken: JWT, refreshToken: newRefreshTokenSecret },
                message: 'User successfully validated on login.',
                status: 200,
                // key to delete if service succeeds but controller fails
                redisKeysToDelete: [redisKeyToDelete, refreshTokenKey],
            }
        } catch (err) {
            await this.redis.del(redisKey)
            await this.redis.del(refreshTokenKey)
            const status = (err instanceof Error && (err.cause as any)?.status) || 500
            return {
                data: null,
                message: err instanceof Error ? err.message : 'Unkown error occurred.',
                status,
            }
        }
    }

    logout = async (payload: { refreshToken: string; userId: string }) => {
        const { refreshToken, userId } = payload
        try {
            const userIdFromToken = await this.redis.get(`${this.#refreshTokenPrefix}${refreshToken}`)
            if (userId !== userIdFromToken) {
                return {
                    message: 'Forbidden',
                    status: 403,
                }
            }
            await this.redis.del(`${this.#refreshTokenPrefix}${refreshToken}`)

            return {
                status: 200,
                message: 'Successfully logged user out',
            }
        } catch (err) {
            return {
                status: 500,
                message: err instanceof Error ? err.message : 'Unkown error',
            }
        }
    }

    refreshJWT = async (payload: {
        refreshToken: string
        req: FastifyRequest
    }): Promise<{
        data?: { accessToken: string; refreshToken: string } | null
        status: number
        message: string
    }> => {
        const { refreshToken, req } = payload
        if (!refreshToken) {
            return { status: 401, message: 'No refresh token received' }
        }

        try {
            // const ATPayload = (await req.server.jwt.verify(req.headers['access-token'] as string, {
            //     ignoreExpiration: true,
            // })) as TokenUserPayload

            const userIdFromRefreshToken = await this.redis.get(`${this.#refreshTokenPrefix}${refreshToken}`)
            if (!userIdFromRefreshToken) {
                return {
                    status: 401,
                    message: 'Failed to locate refresh token',
                }
            }

            const isUserSuspended = await this.redis.get(`user:suspended:${userIdFromRefreshToken}`)
            if (isUserSuspended) {
                return {
                    status: 403,
                    message: 'Account suspended',
                }
            }

            const existingUser = await this.db.manager.findOne(User, {
                where: { id: userIdFromRefreshToken },
                relations: {
                    roles: true,
                    userMetrics: true,
                },
            })
            if (!existingUser) {
                return {
                    status: 404,
                    message: 'User not found',
                }
            }

            const newRefreshTokenSecret = generateSecret()

            await this.redis.del(`${this.#refreshTokenPrefix}${refreshToken}`)
            await this.redis.set(
                `${this.#refreshTokenPrefix}${newRefreshTokenSecret}`,
                existingUser.id,
                'EX',
                process.env.USER_REFRESH_TOKEN_EXPIRATION || 604800,
            ) // default value == 7 days in seconds 604800

            // don't bother deleting the profile if controller fails... it will be reset if this service is hit again anyway - which it will soon thereafter if controller fails
            const { JWT } = await cacheProfileAndSignJWT(existingUser, req.server, this.redis)

            return {
                data: { accessToken: JWT, refreshToken: newRefreshTokenSecret },
                message: 'Access token successfully refreshed',
                status: 200,
            }
        } catch (err) {
            return getErrorReturn(err, 'Unknown err while attempting to refresh user token')
        }
    }

    sendRegistrationConfirmation = async (payload: RegistrationConfirmationEmailPayload) => {
        const { username, email, password, req } = payload

        let redisKeyToDelete = ''
        try {
            await checkMultipleExistingUserDetails(this.db.manager, username, email)
            const userDetails = JSON.stringify({
                email: email,
                username: username,
                // MAKE SURE THERE IS A SALT ROUND ENV!!! 1 is the default for testing speeds
                password: await bcrypt.hash(password, Number(process.env.PASSWORD_SALT_ROUNDS) || 1),
            })

            const { redisKey, confirmationCode } = await cacheConfirmation(
                EmailConfirmationEnum.REGISTRATION,
                this.redis,
                userDetails,
            )

            redisKeyToDelete = redisKey

            await sendConfirmationCodeEmail(EmailConfirmationEnum.REGISTRATION, confirmationCode, email, req)

            return {
                status: 200,
                message: 'Confirmation code successfully generated - awaiting user confirmation',
                redisKeyToDelete,
            }
        } catch (err) {
            await req.server.redis.del(redisKeyToDelete)
            const status = (err instanceof Error && (err.cause as any)?.status) || 500
            return {
                message:
                    err instanceof Error ? err.message : 'Unkown erorr while attempting to generate code confirmation',
                status,
                redisKeyToDelete: '', // already deleted
            }
        }
    }

    sendUserDetailsChangeConfirmation = async (payload: UserDetailsChangeConfirmationPayload) => {
        const { req, userId, ...userDetails } = payload
        let redisKeyToDelete = ''

        try {
            const user = await findOneEntityBy(this.db.manager, User, { id: userId }, 'User')

            if (userDetails.email && !userDetails.password && !userDetails.username) {
                await checkSingleExistingUserDetails(this.db.manager, 'email', userDetails.email)
            } else if (userDetails.username && !userDetails.email && !userDetails.password) {
                await checkSingleExistingUserDetails(this.db.manager, 'username', userDetails.username)
            } else if (userDetails.password && !userDetails.email && !userDetails.username) {
                userDetails.password = await bcrypt.hash(
                    userDetails.password,
                    // MAKE SURE THERE IS A SALT ROUND ENV!!! 1 is the default for testing speeds
                    Number(process.env.PASSWORD_SALT_ROUNDS) || 1,
                )
            } else {
                return {
                    status: 400,
                    message: 'Bad request - attempting to change more than one detail at a time',
                }
            }

            const userDetailsJSON = JSON.stringify(userDetails)

            const confirmationType = userDetails.password
                ? EmailConfirmationEnum.PASSWORD_RESET
                : userDetails.username
                  ? EmailConfirmationEnum.USERNAME_CHANGE
                  : EmailConfirmationEnum.EMAIL_CHANGE

            const { redisKey, confirmationCode } = await cacheConfirmation(
                confirmationType,
                this.redis,
                userDetailsJSON,
            )

            redisKeyToDelete = redisKey

            await sendConfirmationCodeEmail(confirmationType, confirmationCode, user.email, req)

            return {
                status: 200,
                message: 'Confirmation code successfully generated - awaiting user confirmation',
            }
        } catch (err) {
            await req.server.redis.del(redisKeyToDelete)
            const status = (err instanceof Error && (err.cause as any)?.status) || 500
            return {
                message:
                    err instanceof Error ? err.message : 'Unkown erorr while attempting to generate code confirmation',
                status,
            }
        }
    }

    resetPasswordRequest = async (payload: { email: string; req: FastifyRequest }) => {
        const { email, req } = payload
        const redisKeyToDelete = ''

        try {
            const successfulReturn = {
                status: 200,
                message: 'Password reset request sent if mail exists',
            }

            const user = await this.db.manager.findOneBy(User, { email })

            if (!user) {
                // return a 200 even if failed to find users - to minimise information to hakrrrs LOL!
                return successfulReturn
            }

            const userDetails = JSON.stringify({
                email,
            })

            const confirmationCode = generateRandom6CharCode()

            const redisKeyToDelete = `confirmation:forgotten_password:${confirmationCode}`

            await this.redis.set(
                redisKeyToDelete,
                userDetails,
                'EX',
                Number(process.env.REDIS_EMAIL_EXPIRY) || 900, // 15 min (in sec)
                'NX', // check for non-pre-existing key
            )

            await sendConfirmationCodeEmail(EmailConfirmationEnum.PASSWORD_RESET, confirmationCode, email, req)

            return successfulReturn
        } catch (err) {
            await this.redis.del(redisKeyToDelete)
            return {
                status: 500,
                message: err instanceof Error ? err.message : 'Unknown error',
            }
        }
    }
}
