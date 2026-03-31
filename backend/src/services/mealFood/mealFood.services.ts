import { Food } from '@db/entities/food/Food.entity.js'
import { Meal } from '@db/entities/meal/Meal.entity.js'
import { MealFood } from '@db/entities/mealFoodJunction/MealFood.entity.js'
//import { FastifyRedis } from '@fastify/redis'
import { AddMealFoodPayload } from '@services/types/servicePayloadTypes/meal.service.input.types.js'
import { calculateGL } from '@services/utils/calculateGL.util.js'
import { getErrorReturn } from '@services/utils/getErrorReturn.util.js'
import { DataSource, EntityManager } from 'typeorm'
import { contentPer100g } from './ utils.js'
import { Diet } from '@db/entities/diet/Diet.entity.js'
import { rountTo1DP } from '@utilities/round.js'

export class MealFoodServices {
    constructor(
        private db: DataSource,
        //private redis: FastifyRedis,
    ) {}

    getAllFoodsForMeal = async (mealId: string, userId: string) => {
        try {
            const mealFoods = await this.db.manager.find(MealFood, {
                where: {
                    meal: {
                        id: mealId,
                        // ensure that the meal belongs to the requestig user
                        diet: { user: { id: userId } },
                    },
                },
                relations: {
                    food: true,
                },
            })

            // could also be 403 instance as the meal is not found due to a non-mathcing userId
            // but keep only 404 to hide existence of resource
            if (!mealFoods) throw new Error('Meal not found', { cause: { status: 404 } })

            return {
                data: mealFoods,
                message: 'Successfully fetched all foods for a meal',
                status: 200,
            }
        } catch (err) {
            return getErrorReturn(err, 'Unkown error while attempting to fetch foods for a meal')
        }
    }

    addMealFood = async (payload: AddMealFoodPayload) => {
        let existingMealFoods: Food[] = []

        const { foodId, mealId, userId, weight } = payload

        try {
            const savedMeal = await this.db.transaction(async (manager: EntityManager): Promise<Meal> => {
                const mealRepo = manager.getRepository(Meal)

                const existingMeal = await mealRepo.findOne({
                    where: {
                        id: mealId,
                        // ensure that the meal belongs to the requestig user
                        diet: { user: { id: userId } },
                    },
                    relations: ['mealFoods', 'mealFoods.food', 'diet'],
                })

                // could also be 403 instance as the meal is not found due to a non-mathcing userId
                // but keep only 404 to hide existence of resource
                if (!existingMeal)
                    throw new Error('Meal does not exist', {
                        cause: {
                            status: 404,
                        },
                    })

                const existingFood = await manager.findOneBy(Food, { id: foodId })

                if (!existingFood)
                    throw new Error('Food does not exist', {
                        cause: {
                            status: 404,
                        },
                    })

                const newMealFood = manager.create(MealFood, {
                    meal: { id: mealId },
                    food: existingFood,
                    weight: weight,
                })

                existingMeal.mealFoods.push(newMealFood)

                existingMealFoods = existingMeal.mealFoods.map((mf) => ({
                    ...mf.food,
                    foodId: mf.food.id,
                    mealFoodId: mf.id,
                    // mf.food contains a weight prop - always 100g - this sets the weight to the mf.weight - the custom value of the mealfood
                    weight: mf.weight,
                }))

                const diet = existingMeal.diet

                diet.calories -= existingMeal.calories
                diet.proteins -= existingMeal.proteins
                diet.carbohydrates -= existingMeal.carbohydrates
                diet.fats -= existingMeal.fats
                diet.fiber -= existingMeal.fiber

                existingMeal.calories = rountTo1DP(
                    existingMealFoods.reduce((sum, f) => sum + contentPer100g(f.calories, f.weight), 0),
                )
                existingMeal.proteins = rountTo1DP(
                    existingMealFoods.reduce((sum, f) => sum + contentPer100g(f.proteins, f.weight), 0),
                )
                existingMeal.carbohydrates = rountTo1DP(
                    existingMealFoods.reduce((sum, f) => sum + contentPer100g(f.carbohydrates, f.weight), 0),
                )
                existingMeal.fats = rountTo1DP(
                    existingMealFoods.reduce((sum, f) => sum + contentPer100g(f.fats, f.weight), 0),
                )
                existingMeal.fiber = rountTo1DP(
                    existingMealFoods.reduce((sum, f) => sum + contentPer100g(f.fiber, f.weight), 0),
                )

                diet.calories += existingMeal.calories
                diet.proteins += existingMeal.proteins
                diet.carbohydrates += existingMeal.carbohydrates
                diet.fats += existingMeal.fats
                diet.fiber += existingMeal.fiber

                const GL = calculateGL(existingMealFoods, existingMeal.fats, existingMeal.proteins)

                //round to 1 d.p.
                existingMeal.glycemic_load = Math.round(GL)

                await manager.save(Diet, diet)

                return await manager.save(existingMeal)
            })

            const updatedMeal = {
                id: savedMeal.id,
                name: savedMeal.name,
                carbohydrates: savedMeal.carbohydrates,
                fiber: savedMeal.fiber,
                proteins: savedMeal.proteins,
                fats: savedMeal.fats,
                calories: savedMeal.calories,
                glycemic_load: savedMeal.glycemic_load,
                mealFoods: existingMealFoods,
            }

            return {
                message: 'Successfully added food to meal',
                data: updatedMeal,
                status: 201,
            }
        } catch (err) {
            const status = (err instanceof Error && (err.cause as any)?.status) || 500
            return {
                message: err instanceof Error ? err.message : 'Unkown error occurred',
                data: null,
                status,
            }
        }
    }

    removeMealFoodById = async (mealId: string, mealFoodId: string, userId: string) => {
        try {
            await this.db.transaction(async (manager: EntityManager) => {
                const meal = await manager.findOne(Meal, {
                    where: {
                        id: mealId,
                        diet: { user: { id: userId } },
                    },
                    relations: {
                        mealFoods: { food: true },
                        diet: true,
                    },
                })

                if (!meal) throw new Error('Meal not found', { cause: { status: 404 } })

                const mealFoodIndex = meal.mealFoods.findIndex((mealFood) => mealFood.id === mealFoodId)

                // const food = meal.mealFoods[mealFoodIndex].food
                const mealFood = meal.mealFoods[mealFoodIndex]

                meal.mealFoods.splice(mealFoodIndex, 1)

                const existingMealFoods = meal.mealFoods.map((mf) => ({
                    ...mf.food,
                    foodId: mf.food.id,
                    mealFoodId: mf.id,
                    // mf.food contains a weight prop - always 100g - this sets the weight to the mf.weight - the custom value of the mealfood
                    weight: mf.weight,
                }))

                const diet = meal.diet
                diet.calories -= meal.calories
                diet.proteins -= meal.proteins
                diet.carbohydrates -= meal.carbohydrates
                diet.fats -= meal.fats
                diet.fiber -= meal.fiber

                // maybe look into just subtracting for performance, unless it could make prblems...
                meal.calories = rountTo1DP(
                    existingMealFoods.reduce((sum, f) => sum + contentPer100g(f.calories, f.weight), 0),
                )
                meal.proteins = rountTo1DP(
                    existingMealFoods.reduce((sum, f) => sum + contentPer100g(f.proteins, f.weight), 0),
                )
                meal.carbohydrates = rountTo1DP(
                    existingMealFoods.reduce((sum, f) => sum + contentPer100g(f.carbohydrates, f.weight), 0),
                )
                meal.fats = rountTo1DP(existingMealFoods.reduce((sum, f) => sum + contentPer100g(f.fats, f.weight), 0))
                meal.fiber = rountTo1DP(
                    existingMealFoods.reduce((sum, f) => sum + contentPer100g(f.fiber, f.weight), 0),
                )

                diet.calories += meal.calories
                diet.proteins += meal.proteins
                diet.carbohydrates += meal.carbohydrates
                diet.fats += meal.fats
                diet.fiber += meal.fiber

                const GL = calculateGL(existingMealFoods, meal.fats, meal.proteins)

                //round to 1 d.p.
                meal.glycemic_load = Math.round(GL)

                // const removedFood = mealFood.food

                // diet.calories = rountTo1DP(diet.calories - contentPer100g(removedFood.calories, mealFood.weight))
                // diet.proteins = rountTo1DP(diet.proteins - contentPer100g(removedFood.proteins, mealFood.weight))
                // diet.fats = rountTo1DP(diet.fats - contentPer100g(removedFood.fats, mealFood.weight))
                // diet.carbohydrates = rountTo1DP(diet.carbohydrates - contentPer100g(removedFood.carbohydrates, mealFood.weight))
                // diet.fiber = rountTo1DP(diet.fiber - contentPer100g(removedFood.fiber, mealFood.weight))

                await manager.save(Diet, diet)

                await manager.remove(MealFood, mealFood)

                await manager.save(Meal, meal)
            })
            return {
                status: 204,
                message: null,
            }
        } catch (err) {
            return getErrorReturn(err, 'Unknown error while attempting to remove a food for a meal')
        }
    }
}
