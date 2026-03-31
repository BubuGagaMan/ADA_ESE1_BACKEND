import { Food } from '@db/entities/food/Food.entity.js'
import { FastifyReply, FastifyRequest } from 'fastify'
import { ILike } from 'typeorm'
import { CreateFoodRequest } from './types.js'

export default class FoodController {
    async getAllFoods(
        req: FastifyRequest<{ Querystring: { page: string; limit: string; search: string } }>,
        reply: FastifyReply,
    ) {
        try {
            const page = parseInt(req.query.page) || 1
            const limit = parseInt(req.query.limit) || 10
            const search = req.query.search || ''

            const skip = (page - 1) * limit

            const whereClause = search ? { name: ILike(`%${search}%`) } : {}

            const [foods, total] = await req.server.db.manager.findAndCount(Food, {
                where: whereClause,
                take: limit,
                skip: skip,
                order: { name: 'ASC' },
            })

            const totalPages = Math.ceil(total / limit)

            return reply.status(200).send({
                message: 'Successfully fetched foods',
                data: foods,
                meta: {
                    totalItems: total,
                    currentPage: page,
                    totalPages: totalPages,
                    limit: limit,
                },
            })
        } catch (error) {
            req.server.log.error(error)
            return reply.status(500).send({ message: 'Error fetching foods' })
        }
    }

    async create(req: FastifyRequest<CreateFoodRequest>, reply: FastifyReply) {
        const error = 'An error has occurred while attempting to create a new food'

        try {
            const castedFoodData = {
                name: req.body.name,
                carbohydrates: Number(req.body.carbohydrates),
                fiber: Number(req.body.fiber),
                proteins: Number(req.body.proteins),
                fats: Number(req.body.fats),
                calories: Number(req.body.calories),
                weight: Number(req.body.weight),
                glycemic_index: Number(req.body.glycemic_index),
            }

            const { data, message, status } = await req.server.foodServices.createFood(castedFoodData)

            if (!data) {
                reply.status(status).send({ error, message })
                return
            }

            reply.status(status).send({ message, data })
            return
        } catch (err) {
            reply.status(500).send({
                error,
                message: err instanceof Error ? err.message : 'Unkown error',
            })
        }
    }
}
