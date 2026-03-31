import { Diet } from '@db/entities/diet/Diet.entity.js'
import { Meal } from '@db/entities/meal/Meal.entity.js'
//import { FastifyRedis } from '@fastify/redis'
import {
    CreateMealData,
    DeleteMealByIdPayload,
    GetAllMealsForDietPayload,
    UpdateMealByIdPayload,
} from '@services/types/servicePayloadTypes/meal.service.input.types.js'
import { findOneEntityBy } from '@services/utils/entityManagerOps.util.js'
import { getErrorReturn } from '@services/utils/getErrorReturn.util.js'
import { DataSource, EntityManager } from 'typeorm'

export class MealServices {
    constructor(
        private db: DataSource,
        //private redis: FastifyRedis,
    ) {}

    getAllMealsForDiet = async (payload: GetAllMealsForDietPayload) => {
        const { userId, dietId } = payload
        try {
            const meals = await this.db.manager.find(Meal, {
                where: {
                    diet: { id: dietId, user: { id: userId } },
                },
            })

            return {
                data: meals,
                message: 'Successfully fetched all meals for a diet',
                status: 200,
            }
        } catch (err) {
            return {
                data: null,
                message: err instanceof Error ? err.message : 'Unknown error',
                status: 500,
            }
        }
    }

    createMeal = async (data: CreateMealData) => {
        const { name, dietId } = data
        // only name is required- see entity for defaulted values
        const newMeal = this.db.manager.create(Meal, {
            name,
            diet: { id: dietId },
        })

        try {
            const savedMeal = await this.db.manager.save(newMeal)

            return {
                data: savedMeal,
                message: 'Successfully created a new meal for user diet',
                status: 201,
            }
        } catch (err) {
            return {
                data: null,
                message: err instanceof Error ? err.message : 'Unkown error',
                status: 500,
            }
        }
    }

    updateMealById = async (payload: UpdateMealByIdPayload) => {
        const { mealId, userId, name } = payload
        try {
            const meal = await findOneEntityBy(
                this.db.manager,
                Meal,
                { id: mealId, diet: { user: { id: userId } } },
                'Meal not found',
            )

            meal.name = name

            await this.db.manager.save(Meal, meal)

            return {
                data: meal,
                message: 'Successfully updated meal',
                status: 200,
            }
        } catch (err) {
            return getErrorReturn(err, 'Unknown error while attempting to update meal')
        }
    }

    removeMealById = async (payload: DeleteMealByIdPayload) => {
        const { mealId, userId } = payload

        try {
            await this.db.transaction(async (manager: EntityManager) => {
                const meal = await manager.findOne(Meal, {
                    where: {
                        id: mealId,
                        diet: { user: { id: userId } },
                    },
                    relations: {
                        diet: true,
                    },
                })

                if (!meal) throw new Error('Meal not found', { cause: { status: 404 } })

                const diet = meal.diet

                diet.calories -= meal.calories
                diet.proteins -= meal.proteins
                diet.carbohydrates -= meal.carbohydrates
                diet.fats -= meal.fats
                diet.fiber -= meal.fiber

                await manager.save(Diet, diet)

                await this.db.manager.remove(Meal, meal)
            })

            return {
                status: 204,
            }
        } catch (err) {
            return getErrorReturn(err, 'Unknown error while attempting to remove meal')
        }
    }
}
