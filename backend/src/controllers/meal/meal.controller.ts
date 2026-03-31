import { GetOneDietById } from '@controllers/diet/types.js'
import { generateDeleteReply, generateGenericReply } from '@controllers/utils/generateControllerReply.js'
import {
    DeleteMealByIdPayload,
    GetAllMealsForDietPayload,
    UpdateMealByIdPayload,
} from '@services/types/servicePayloadTypes/meal.service.input.types.js'
import { FastifyReply, FastifyRequest } from 'fastify'

import { CreateMealRequest, GetMealByIdRequest, UpdateMealRequest } from './types.js'

class MealController {
    async getAllMealsForDiet(req: FastifyRequest<GetOneDietById>, reply: FastifyReply) {
        const payload: GetAllMealsForDietPayload = {
            userId: req.user.id,
            dietId: req.params.dietId,
        }

        return generateGenericReply(
            payload,
            req.server.mealServices.getAllMealsForDiet,
            reply,
            'An error has occurred while attempting to get all meals for a diet',
        )
    }

    async createMeal(req: FastifyRequest<CreateMealRequest>, reply: FastifyReply) {
        const payload = {
            name: req.body.name,
            dietId: req.params.dietId,
        }

        return await generateGenericReply(
            payload,
            req.server.mealServices.createMeal.bind(req.server.mealServices),
            reply,
            'An error occurred while attempting to create a new meal within a diet',
        )
    }

    async updateMealById(req: FastifyRequest<UpdateMealRequest>, reply: FastifyReply) {
        const payload: UpdateMealByIdPayload = {
            name: req.body.name,
            mealId: req.params.mealId,
            userId: req.user.id,
        }

        return await generateGenericReply(
            payload,
            req.server.mealServices.updateMealById,
            reply,
            'An error has occurred while attempting to update meal',
        )
    }

    deleteMealById = async (req: FastifyRequest<GetMealByIdRequest>, reply: FastifyReply) => {
        const payload: DeleteMealByIdPayload = {
            userId: req.user.id,
            mealId: req.params.mealId,
        }

        return await generateDeleteReply(
            payload,
            req.server.mealServices.removeMealById,
            reply,
            'An error has occurred while attempting to remove meal',
        )
    }
}

export default new MealController()
