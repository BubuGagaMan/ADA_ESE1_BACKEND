import { QueryRunner } from 'typeorm'
import { dietsArr } from './diet.fixtures.js'
import addDiet from './addDiet.js'

export const seedDiets = async (queryRunner: QueryRunner) => {
    try {
        for (const diet of dietsArr) {
            await addDiet(diet, queryRunner.manager)
        }
    } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : 'Unknown error'
        throw new Error(`Error while attempting to seed diets: ${errMessage}`)
    }
}
