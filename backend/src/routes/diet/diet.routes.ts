import { FastifyInstance } from 'fastify'
import DietController from '@controllers/diet/diet.controller.js'
import mealController from '@controllers/meal/meal.controller.js'
import { CreateDiet, GetOneDietById, UpdateDietById } from '@controllers/diet/types.js'
import { CreateMealRequest } from '@controllers/meal/types.js'
import { createMealSchema, getOneDietSchema } from './diet.schemas.js'

export default async function dietR(app: FastifyInstance) {
    const dietController = new DietController()

    // get all diets for a user
    app.get(
        '/diet',
        {
            onRequest: [
                app.authenticate,
                // async (req: ReqWithUserIdParams, reply: FastifyReply) => {
                //     await authorise(req, reply, ["admin"], true);
                // },
            ],
        },
        dietController.getAllDietsByUserId,
    )

    // get diet by id
    app.get<GetOneDietById>(
        '/diet/:dietId',
        {
            schema: getOneDietSchema,
            onRequest: [app.authenticate],
        },
        dietController.getOneDietById,
    )

    // create a new diet
    app.post<CreateDiet>(
        '/diet',
        {
            onRequest: [
                app.authenticate,
                // async (req: ReqWithUserIdParams, reply: FastifyReply) => {
                //     await authorise(req, reply, ["admin"], true);
                // },
            ],
        },
        dietController.createDiet,
    )

    // update user diet
    app.put<UpdateDietById>(
        '/diet/:dietId',
        {
            onRequest: [
                app.authenticate,
                // async (req: ReqWithUserIdParams, reply: FastifyReply) => {
                //     await authorise(req, reply, ["admin"], true);
                // },
            ],
        },
        dietController.updateDietById,
    )

    // delete user diet
    app.delete<{ Params: { dietId: string } }>(
        '/diet/:dietId',
        {
            schema: getOneDietSchema,
            onRequest: [
                app.authenticate,
                // async (req: ReqWithUserIdParams, reply: FastifyReply) => {
                //     await authorise(req, reply, ["admin"], true);
                // },
            ],
        },
        dietController.deleteDietById,
    )

    // diet <-> meal operations

    // see all meals for a diet
    app.get<{ Params: { dietId: string } }>(
        '/diet/:dietId/meal',
        {
            schema: getOneDietSchema,
            onRequest: [
                app.authenticate,
                // async (req: ReqWithUserIdParams, reply: FastifyReply) => {
                //     await authorise(req, reply, ["admin"], true);
                // },
            ],
        },
        mealController.getAllMealsForDiet,
    )

    // create a new meal for a diet
    app.post<CreateMealRequest>(
        '/diet/:dietId/meal',
        {
            schema: createMealSchema,
            onRequest: [
                app.authenticate,
                // async (req: ReqWithUserIdParams, reply: FastifyReply) => {
                //     await authorise(req, reply, ["admin"], true);
                // },
            ],
        },
        mealController.createMeal,
    )
}
