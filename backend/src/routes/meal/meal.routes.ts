import mealController from '@controllers/meal/meal.controller.js'
import { GetMealByIdRequest, UpdateMealRequest } from '@controllers/meal/types.js'
import mealFoodController from '@controllers/mealFood/mealFood.controller.js'
import { AddFoodToMealRequest, DeleteMealFoodByIdRequest } from '@controllers/mealFood/types.js'
import { FastifyInstance } from 'fastify'
import { addFoodToMealSchema, deleteMealFoodSchema, getMealSchema, updateMealSchema } from './meal.schemas.js'

export default async function mealR(app: FastifyInstance) {
    // update a meal - wouldn't need to dietId here
    app.put<UpdateMealRequest>(
        '/meal/:mealId',
        {
            schema: updateMealSchema,
            onRequest: [app.authenticate],
        },
        mealController.updateMealById,
    )

    // delete a meal - wouldn't need to dietId here
    app.delete<GetMealByIdRequest>(
        '/meal/:mealId',
        {
            schema: getMealSchema,
            onRequest: [app.authenticate],
        },
        mealController.deleteMealById,
    )

    // meal <-> meal-food operations

    // add new food to a meal
    app.post<AddFoodToMealRequest>(
        '/meal/:mealId/food/:foodId',
        {
            schema: addFoodToMealSchema,
            config: { resource: 'food' }, // food resource for validation errors grouping...
            onRequest: [app.authenticate],
        },
        mealFoodController.addFoodToMeal,
    )

    // see all foods within a meal
    app.get<GetMealByIdRequest>(
        '/meal/:mealId/meal-food',
        {
            schema: getMealSchema,
            onRequest: [app.authenticate],
        },
        mealFoodController.getAllFoodsForMeal,
    )

    // delete a food from a meal
    app.delete<DeleteMealFoodByIdRequest>(
        '/meal/:mealId/meal-food/:mealFoodId',
        {
            schema: deleteMealFoodSchema,
            onRequest: [app.authenticate],
        },
        mealFoodController.deleteMealFoodById,
    )
}
