import { FastifyRequest, FastifyReply } from 'fastify'

import UserMetricsRepository from '@db/entities/user_metrics/UserMetrics.repository.js'
import { UpdateUserMetricsPayload } from '@services/types/servicePayloadTypes/userMetrics.service.payload.js'
import { generateGenericReply } from '@controllers/utils/generateControllerReply.js'
import { CreateUserMetricsRequest } from './types.js'

export default class UserMetricsController {
    private userMetricsRepository

    constructor() {
        this.userMetricsRepository = UserMetricsRepository
    }

    create = async (req: FastifyRequest<CreateUserMetricsRequest>, reply: FastifyReply) => {
        const userId = req.user.id

        const error = 'An error has occurred while trying to create a new user metric for user'

        const castedBody = {
            dob: req.body.dob,
            height: Number(req.body.height),
            weight: Number(req.body.weight),
            sex: Number(req.body.sex),
            activity_level: req.body.activity_level,
        }

        try {
            const { data, message, status } = await req.server.userMetricsServices.createUserMetrics(castedBody, userId)

            if (!data) {
                reply.status(status).send({ error, message })
                return
            }

            reply.status(status).send({ message, data })
            return
        } catch (err) {
            return reply.status(500).send({
                error,
                message: err instanceof Error ? err.message : 'Uknown error',
            })
        }
    }

    get = async (req: FastifyRequest, reply: FastifyReply) => {
        const userMetrics = await this.userMetricsRepository.findOne({
            // where: { user_id: req.user.id },
            where: {
                user: { id: req.user.id },
            },
        })

        return reply.status(200).send({ message: 'User metrics successfully retrieved!', data: { userMetrics } })
    }

    put = async (req: FastifyRequest<CreateUserMetricsRequest>, reply: FastifyReply) => {
        const payload: UpdateUserMetricsPayload = {
            ...req.body,
            userId: req.user.id,
        }

        return await generateGenericReply(
            payload,
            req.server.userMetricsServices.updateUserMetrics,
            reply,
            'An error has ocurred while attempting to update user metrics',
        )
    }
}
