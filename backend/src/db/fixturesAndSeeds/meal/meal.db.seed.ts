import { QueryRunner } from 'typeorm'
import { mealsArr } from './meal.fixtures.js'
import addMealWithJunction from './addMealWithJunction.js'

export const seedMeals = async (queryRunner: QueryRunner) => {
    try {
        for (const meal of mealsArr) {
            await addMealWithJunction(meal, queryRunner.manager)
        }
    } catch (err) {
        throw new Error(`Error seeding meals: ${err instanceof Error ? err.message : 'Unknown'}`)
    }
}
