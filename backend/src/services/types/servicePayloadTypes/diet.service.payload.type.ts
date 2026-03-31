import { WEIGHT_GOAL } from '@db/entities/diet/Diet.entity.js'
import { IUserIdPayload } from './userId.payload.js'
import { ACTIVITY_LEVEL, SEX } from '@db/entities/user_metrics/UserMetrics.entity.js'

export interface CreateDietPayload {
    name: string
    weightGoal: WEIGHT_GOAL
    userId: string
}

export type UserMetricsFormRequest = {
    height: number
    weight: number
    sex: SEX
    dob: string
    activity_level: ACTIVITY_LEVEL
}

export interface UpdateDietByIdPayload extends IUserIdPayload {
    name: string
    weightGoal: WEIGHT_GOAL
    dietId: string
    userMetrics: UserMetricsFormRequest
}

export interface GetDietByIdPayload extends IUserIdPayload {
    dietId: string
}
