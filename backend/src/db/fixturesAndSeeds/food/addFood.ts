import { EntityManager } from 'typeorm'
import { Food } from '@db/entities/food/Food.entity.js'

type FoodData = {
    id: string
    name: string
    carbohydrates: number
    proteins: number
    calories: number
    fiber: number
    weight: number
    glycemic_index: number
}

const addFood = async (
    foodData: FoodData,
    manager: EntityManager, // pass EntityManager from QueryRunner
) => {
    const food = manager.create(Food, {
        ...foodData,
    })

    await manager.save(food)
}

export default addFood
