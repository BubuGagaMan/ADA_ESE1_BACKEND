import FoodController from '@controllers/food/food.controller.js'
import { CreateFoodRequest } from '@controllers/food/types.js'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export default async function foodR(app: FastifyInstance) {
    const foodController = new FoodController()

    app.post<CreateFoodRequest>(
        '/food',
        {
            onRequest: [
                app.authenticate,
                async (req: FastifyRequest, reply: FastifyReply) => {
                    await app.authorise(req, reply, ['ADMIN'])
                },
            ],
        },
        foodController.create,
    )
    app.get('/food', foodController.getAllFoods)
}
