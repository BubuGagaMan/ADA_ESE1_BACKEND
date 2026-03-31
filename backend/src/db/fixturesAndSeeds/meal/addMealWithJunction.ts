import { EntityManager } from 'typeorm'
import { MealData } from './meal.fixtures.js'
import { MealFood } from '@db/entities/mealFoodJunction/MealFood.entity.js'
import { Food } from '@db/entities/food/Food.entity.js'
import { Diet } from '@db/entities/diet/Diet.entity.js'
import { Meal } from '@db/entities/meal/Meal.entity.js'

const addMealWithJunction = async (mealData: MealData, manager: EntityManager) => {
    const diet = await manager.findOneBy(Diet, { id: mealData.dietId })
    if (!diet) throw new Error(`Diet ${mealData.dietId} not found`)

    const meal = manager.create(Meal, {
        id: mealData.id,
        name: mealData.name,
        carbohydrates: mealData.carbohydrates,
        proteins: mealData.proteins,
        fats: mealData.fats,
        fiber: mealData.fiber,
        calories: mealData.calories,
        glycemic_load: mealData.glycemic_load,
        diet: diet,
    })

    await manager.save(meal)

    //  create junction table entries (MealFood)
    for (const item of mealData.foodItems) {
        const food = await manager.findOneBy(Food, { id: item.foodId })
        if (!food) throw new Error(`Food ${item.foodId} not found`)

        const mealFood = manager.create(MealFood, {
            weight: item.weight,
            meal: meal,
            food: food,
        })

        await manager.save(mealFood)
    }
}

export default addMealWithJunction
