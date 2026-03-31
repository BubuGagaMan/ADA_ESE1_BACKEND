import { User } from '@db/entities/user/User.entity.js'
// import { FastifyRedis } from '@fastify/redis' // save for later
import {
    CreateDietPayload,
    GetDietByIdPayload,
    UpdateDietByIdPayload,
} from '@services/types/servicePayloadTypes/diet.service.payload.type.js'
import { throwRequestingUserNotFound } from '@services/utils/throwEntityNotFound.js'
import { DataSource, EntityManager } from 'typeorm'
import { computeDailyNutrition } from '../utils/calculateDiet.util.js'
import { Diet } from '@db/entities/diet/Diet.entity.js'
import { getErrorReturn } from '@services/utils/getErrorReturn.util.js'
import { IUserIdPayload } from '@services/types/servicePayloadTypes/userId.payload.js'
import { findOneEntityBy } from '@services/utils/entityManagerOps.util.js'

export class DietServices {
    constructor(
        private db: DataSource,
        // private redis: FastifyRedis,
    ) {}

    readAllDietsByUserId = async (payload: IUserIdPayload) => {
        try {
            const diets = await this.db.manager.find(Diet, {
                where: { user: { id: payload.userId } },
            })

            return {
                data: diets,
                message: 'Successfully fetched all user diets',
                status: 200,
            }
        } catch (err) {
            return {
                data: null,
                message: err instanceof Error ? err.message : 'Unknown error while attempting to fetch all user diets',
                status: 500,
            }
        }
    }

    readOneDietById = async (payload: GetDietByIdPayload) => {
        const { dietId, userId } = payload
        try {
            const diet = await findOneEntityBy(this.db.manager, Diet, { user: { id: userId }, id: dietId }, 'Diet')

            return {
                data: diet,
                status: 200,
                message: 'Successfully retrieved diet',
            }
        } catch (err) {
            return getErrorReturn(err, 'Unknown error when attempting to read a diet by id')
        }
    }

    createDiet = async (payload: CreateDietPayload) => {
        const { weightGoal, name, userId } = payload
        try {
            const savedDiet = await this.db.transaction(async (manager: EntityManager): Promise<Diet> => {
                const existingUser = await manager.findOne(User, {
                    where: {
                        id: userId,
                    },
                    relations: {
                        userMetrics: true,
                    },
                })

                throwRequestingUserNotFound(existingUser)
                const userMetrics = existingUser?.userMetrics

                // 422 - unproccessable, the user request data is right, but request is not completable right now (as the userMetrics are missing, even as the user isn't)
                if (!userMetrics) throw new Error('User has no user metrics', { cause: { status: 422 } })

                const dailyCalorieTarget = computeDailyNutrition(userMetrics, weightGoal)

                const newDiet = manager.create(Diet, {
                    name: name,
                    user: { id: userId },
                    ...dailyCalorieTarget,
                    weight_goal: weightGoal,
                })

                return await manager.save(Diet, newDiet)
            })

            return {
                data: savedDiet,
                message: 'New diet successfully created for user',
                status: 201,
            }
        } catch (err) {
            const status = (err instanceof Error && (err.cause as any)?.status) || 500
            return {
                data: null,
                message: err instanceof Error ? err.message : 'Unkown error occurred',
                status,
            }
        }
    }

    updateDietById = async (payload: UpdateDietByIdPayload) => {
        const { weightGoal, name, dietId, userId, userMetrics } = payload

        try {
            const diet = await this.db.manager.findOneBy(Diet, { id: dietId, user: { id: userId } })

            if (!diet) throw new Error('Diet not found', { cause: { status: 404 } })

            if (name) diet.name = name
            // maintenance goal would be 0 - ensure it doesn't default to false if 0
            if (weightGoal || weightGoal === 0) diet.weight_goal = weightGoal

            if (userMetrics) {
                try {
                    const dailyDietTargets = computeDailyNutrition(userMetrics, weightGoal)
                    if (!dailyDietTargets.daily_calorie_target) {
                        throw new Error('Could not calculate daily calories in diet')
                    }

                    Object.assign(diet, dailyDietTargets)
                } catch (err) {
                    throw new Error(err instanceof Error ? err.message : 'Unknown error')
                }
            }

            const savedDiet = await this.db.manager.save(Diet, diet)

            return {
                data: savedDiet,
                message: 'Successfully updated diet',
                status: 200,
            }
        } catch (err) {
            return getErrorReturn(err, 'Unknown error while attempting to update diet')
        }
    }

    removeDietById = async (payload: GetDietByIdPayload) => {
        const { dietId, userId } = payload
        try {
            const diet = await this.db.manager.findOneBy(Diet, { id: dietId, user: { id: userId } })

            if (!diet) throw new Error('Diet not found', { cause: { status: 404 } })

            await this.db.manager.remove(Diet, diet)

            return {
                status: 204,
            }
        } catch (err) {
            return {
                message: err instanceof Error ? err.message : 'Unkown error while attempting to remove diet',
                status: 500,
            }
        }
    }
}
