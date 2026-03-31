import { foodsArr } from './food.fixtures.js'
import addFood from './addFood.js'
import { QueryRunner } from 'typeorm'

export const seedFoods = async (queryRunner: QueryRunner) => {
    try {
        for (const food of foodsArr) {
            await addFood(food, queryRunner.manager)
        }
    } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : 'Unknown error'
        throw new Error(`Error while attempting to seed foods: ${errMessage}`)
    }
}
