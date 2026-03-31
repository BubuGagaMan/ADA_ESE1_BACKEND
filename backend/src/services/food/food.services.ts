import { Food } from '@db/entities/food/Food.entity.js'
// import { FastifyRedis } from '@fastify/redis'
import { ICreateFoodData } from '@services/types/servicePayloadTypes/food.service.input.types.js'
import { findOneEntityBy } from '@services/utils/entityManagerOps.util.js'
import { getErrorReturn } from '@services/utils/getErrorReturn.util.js'
import { DataSource } from 'typeorm'

export class FoodServices {
    constructor(
        private db: DataSource,
        //private redis: FastifyRedis,
    ) {}

    createFood = async (data: ICreateFoodData) => {
        const newFood = this.db.manager.create(Food, {
            ...data,
        })

        try {
            const savedFood = await this.db.manager.save(newFood)

            return {
                data: savedFood,
                message: 'Successfully created a new food',
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

    updateFoodById = async (data: ICreateFoodData, foodId: string) => {
        try {
            const food = await findOneEntityBy(this.db.manager, Food, { id: foodId }, 'Food not found')

            Object.assign(food, data)

            await this.db.manager.save(Food, food)

            return {
                data: food,
                message: 'Successfully updated food',
                status: 200,
            }
        } catch (err) {
            return getErrorReturn(err, 'Unknown error while attempting to update food')
        }
    }
}
