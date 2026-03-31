import { GetMealByIdRequest } from '@controllers/meal/types.js'
import { AddMealFoodPayload } from '@services/types/servicePayloadTypes/meal.service.input.types.js'
import { FastifyReply, FastifyRequest } from 'fastify'
import { AddFoodToMealRequest, DeleteMealFoodByIdRequest } from './types.js'

class MealFoodController {
    async getAllFoodsForMeal(req: FastifyRequest<GetMealByIdRequest>, reply: FastifyReply) {
        const error = 'Error occurred while attempting to get all foods for a meal'
        const mealId = req.params.mealId
        const userId = req.user.id

        try {
            const { data, message, status } = await req.server.mealFoodServices.getAllFoodsForMeal(mealId, userId)

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

    async addFoodToMeal(req: FastifyRequest<AddFoodToMealRequest>, reply: FastifyReply) {
        const error = 'Error ocurred while attempting to add food for a meal'
        const payload: AddMealFoodPayload = {
            foodId: req.params.foodId,
            mealId: req.params.mealId,
            userId: req.user.id,
            weight: req.body.weight,
        }

        try {
            const { data, message, status } = await req.server.mealFoodServices.addMealFood(payload)

            if (!data) {
                reply.status(status).send({ error, message })
                return
            }
            reply.status(status).send({ message, data })
            return
        } catch (err) {
            console.error(err)
            return reply.status(500).send({
                error,
                message: err instanceof Error ? err.message : 'Uknown error',
            })
        }
    }

    async deleteMealFoodById(req: FastifyRequest<DeleteMealFoodByIdRequest>, reply: FastifyReply) {
        const error = 'Error occurred while attempting to delete a food from a meal'
        const userId = req.user.id
        const mealId = req.params.mealId
        const mealFoodId = req.params.mealFoodId

        try {
            const { message, status } = await req.server.mealFoodServices.removeMealFoodById(mealId, mealFoodId, userId)

            // remember reverse logic here - successful delete won't have a message
            if (message) {
                reply.status(status).send({ error, message })
                return
            }

            reply.status(status).send()
            return
        } catch (err) {
            return reply.status(500).send({
                error,
                message: err instanceof Error ? err.message : 'Uknown error',
            })
        }
    }
}

export default new MealFoodController()
