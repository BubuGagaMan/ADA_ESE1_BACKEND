import { FastifyRequest, FastifyReply } from 'fastify'
import UserRepository from '@db/entities/user/User.repository.js'
import { UpdateUserPayload } from '@services/types/servicePayloadTypes/user.service.payload.type.js'
import { generateDeleteReply, generateGenericReply } from '@controllers/utils/generateControllerReply.js'

import { Like } from 'typeorm'
import { EditProfileImageBody, UpdateUserBody } from './types.js'

export default class UserController {
    private userRepository

    constructor() {
        this.userRepository = UserRepository
    }

    // keep admin routes implemented here
    getAll = async (
        req: FastifyRequest<{ Querystring: { page: number; limit: string; search?: string } }>,
        reply: FastifyReply,
    ) => {
        try {
            const { search = '', page = 1 } = req.query as { search: string; page: number }

            const limit = 20
            const skip = (page - 1) * limit

            // 2. Fetch data with filtering and pagination
            const [users, total] = await this.userRepository.findAndCount({
                where: search ? { username: Like(`%${search}%`) } : {},
                relations: ['roles', 'roles.permissions'],
                take: limit,
                skip: skip,
                order: { username: 'ASC' }, // Optional: keeps results predictable
            })

            return reply.status(200).send({
                message: 'Successfully retrieved users!',
                data: {
                    users,
                    meta: {
                        totalItems: total,
                        itemCount: users.length,
                        itemsPerPage: limit,
                        totalPages: Math.ceil(total / limit),
                        currentPage: Number(page),
                    },
                },
            })
        } catch (err) {
            return reply.status(500).send({
                error: 'An error has occurred while attempting to fetch all users',
                message: err instanceof Error ? err.message : 'Unknown error',
            })
        }
    }

    getProfile = async (req: FastifyRequest, reply: FastifyReply) => {
        const userId = req.user.id

        try {
            const userProfileJSON = await req.server.redis.get(`user:profile:${userId}`)

            if (!userProfileJSON) {
                const user = await this.userRepository.findOne({
                    where: { id: userId },
                    relations: ['roles', 'roles.permissions'],
                })

                if (!user) {
                    return reply.status(404).send({ message: 'Failed to get user - user not found.' })
                }
                const { password: pw, ...noPasswordUserData } = user
                return reply.status(200).send({
                    message: `User successfully retrieved!`,
                    data: { noPasswordUserData },
                })
            }

            const user = JSON.parse(userProfileJSON)

            return reply.status(200).send({
                message: `User successfully retrieved!`,
                data: { user },
            })
        } catch (err) {
            return reply.status(500).send({
                error: 'Error while attempting to fetch user profile',
                message: err instanceof Error ? err.message : 'Unknown error',
            })
        }
    }

    updateById = async (req: FastifyRequest<{ Body: UpdateUserBody }>, reply: FastifyReply) => {
        const payload: UpdateUserPayload = {
            ...req.body,
            userId: req.user.id,
        }

        return await generateGenericReply(
            payload,
            req.server.userServices.updateUserById,
            reply,
            'An error has occurred while attempting to update user',
        )
    }

    resetPassword = async (
        req: FastifyRequest<{ Body: { confirmationCode: string; password: string } }>,
        reply: FastifyReply,
    ) => {
        const error = 'An error ocurred while attempting to reset password'

        const payload = {
            ...req.body,
        }
        let redisKeyToDelete = ''
        try {
            const { status, message } = await req.server.userServices.resetPassword(payload)

            if (status !== 200) {
                return reply.status(status).send({ error, message })
            }

            return reply.status(status).send(message)
        } catch (err) {
            await req.server.redis.del(redisKeyToDelete)
            return reply.status(500).send({ error, message: err instanceof Error ? err.message : 'Unkown error' })
        }
    }

    deleteById = async (req: FastifyRequest, reply: FastifyReply) => {
        const payload: { userId: string } = {
            userId: req.user.id,
        }

        return await generateDeleteReply(
            payload,
            req.server.userServices.removeUserById,
            reply,
            'An error has ocurred while attempting to remove user',
        )
    }

    editProfileImage = async (req: FastifyRequest<{ Body: EditProfileImageBody }>, reply: FastifyReply) => {
        const payload = {
            profile_image_url: req.body.profile_image_url,
            userId: req.user.id,
        }

        return await generateGenericReply(
            payload,
            req.server.userServices.editProfileImage,
            reply,
            'An error has occurred while attempting to edit user profile image',
        )
    }
}
