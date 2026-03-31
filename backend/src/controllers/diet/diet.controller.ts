import { FastifyReply, FastifyRequest } from 'fastify'
import { CreateDiet, GetOneDietById, UpdateDietById } from './types.js'
import {
    GetDietByIdPayload,
    UpdateDietByIdPayload,
} from '@services/types/servicePayloadTypes/diet.service.payload.type.js'
import { generateDeleteReply, generateGenericReply } from '@controllers/utils/generateControllerReply.js'
import { IUserIdPayload } from '@services/types/servicePayloadTypes/userId.payload.js'

export default class DietController {
    getAllDietsByUserId = async (req: FastifyRequest, reply: FastifyReply) => {
        const payload: IUserIdPayload = {
            userId: req.user.id,
        }

        return await generateGenericReply(
            payload,
            req.server.dietServices.readAllDietsByUserId,
            reply,
            'There was an error while attempting to get diets',
        )
    }
    getOneDietById = async (req: FastifyRequest<GetOneDietById>, reply: FastifyReply) => {
        const payload: GetDietByIdPayload = {
            userId: req.user.id,
            dietId: req.params.dietId,
        }

        return await generateGenericReply(
            payload,
            req.server.dietServices.readOneDietById,
            reply,
            'There was an error while attempting to get given diet',
        )
    }

    createDiet = async (req: FastifyRequest<CreateDiet>, reply: FastifyReply) => {
        const error = 'Error occurred while attempting to create a new diet'

        const payload = {
            weightGoal: Number(req.body.weightGoal),
            name: req.body.name,
            userId: req.user.id,
        }

        try {
            const { data, message, status } = await req.server.dietServices.createDiet(payload)

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

    updateDietById = async (req: FastifyRequest<UpdateDietById>, reply: FastifyReply) => {
        const payload: UpdateDietByIdPayload = {
            ...req.body,
            userId: req.user.id,
            dietId: req.params.dietId,
        }

        return await generateGenericReply(
            payload,
            req.server.dietServices.updateDietById,
            reply,
            'An error has occurred while attempting to update diet',
        )
    }

    deleteDietById = async (req: FastifyRequest<GetOneDietById>, reply: FastifyReply) => {
        const payload: GetDietByIdPayload = {
            userId: req.user.id,
            dietId: req.params.dietId,
        }

        return await generateDeleteReply(
            payload,
            req.server.dietServices.removeDietById,
            reply,
            'An error has occurred while attempting to remove diet',
        )
    }
}
