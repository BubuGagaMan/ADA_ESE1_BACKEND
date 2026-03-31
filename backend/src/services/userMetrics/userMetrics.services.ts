import { Diet } from '@db/entities/diet/Diet.entity.js'
import { User } from '@db/entities/user/User.entity.js'
import { UserMetrics } from '@db/entities/user_metrics/UserMetrics.entity.js'
//import { FastifyRedis } from '@fastify/redis'
import { IUserMetricsServiceReturn } from '@services/serviceReturn.types.js'
import { UpdateUserMetricsPayload } from '@services/types/servicePayloadTypes/userMetrics.service.payload.js'
import { computeDailyNutrition } from '@services/utils/calculateDiet.util.js'
import { findOneEntityBy } from '@services/utils/entityManagerOps.util.js'
import { getErrorReturn } from '@services/utils/getErrorReturn.util.js'
import { UserMetricsCreateBody } from '@src/requestDataTypes/userMetrics.types.js'
import { DataSource, EntityManager } from 'typeorm'

export class UserMetricsServices {
    constructor(
        private db: DataSource,
        //private redis: FastifyRedis,
    ) {}

    async createUserMetrics(data: UserMetricsCreateBody, requestingUserId: string): Promise<IUserMetricsServiceReturn> {
        try {
            const userWithNewUserMetrics = await this.db.transaction(async (manager: EntityManager): Promise<User> => {
                const existingUser = await manager.findOneBy(User, { id: requestingUserId })

                if (!existingUser)
                    throw new Error('Requesting user does not exist', {
                        cause: {
                            status: 404,
                        },
                    })

                const newUserMetrics = manager.create(UserMetrics, {
                    ...data,
                })

                existingUser.userMetrics = newUserMetrics

                // note that there is a cascade insert; update on user - userMetrics; no need to save both
                return await manager.save(User, existingUser)
            })

            return {
                data: userWithNewUserMetrics,
                message: 'Successfully created new user metrics for user',
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

    updateUserMetrics = async (payload: UpdateUserMetricsPayload) => {
        const { dob, activity_level, height, sex, weight, userId } = payload

        try {
            const userMetrics = await this.db.transaction(async (manager: EntityManager) => {
                const userMetrics = await findOneEntityBy(
                    manager,
                    UserMetrics,
                    { user: { id: userId } },
                    'User metrics',
                )

                Object.assign(userMetrics, { dob, activity_level, height, sex, weight })

                await manager.save(UserMetrics, userMetrics)

                const diets = await manager.find(Diet, {
                    where: {
                        user: { id: userId },
                    },
                })

                diets.forEach((diet) => {
                    const dailyTargets = computeDailyNutrition(userMetrics, diet.weight_goal)
                    Object.assign(diet, dailyTargets)
                })

                await manager.save(Diet, diets)

                return userMetrics
            })

            return {
                message: 'Successfully updated user metrics',
                status: 200,
                data: userMetrics,
            }
        } catch (err) {
            return getErrorReturn(err, 'An unknown error has ocurred while attempting to update user metrics')
        }
    }
}
