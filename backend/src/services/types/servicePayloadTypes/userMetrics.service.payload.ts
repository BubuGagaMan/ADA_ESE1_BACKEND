import { ACTIVITY_LEVEL, SEX } from '@db/entities/user_metrics/UserMetrics.entity.js'
import { IUserIdPayload } from './userId.payload.js'

export interface UpdateUserMetricsPayload extends IUserIdPayload {
    dob: string
    weight: number
    sex: SEX
    height: number
    activity_level: ACTIVITY_LEVEL
}
