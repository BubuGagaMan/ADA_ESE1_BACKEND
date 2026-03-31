import { ACTIVITY_LEVEL, SEX } from '@db/entities/user_metrics/UserMetrics.entity.js'

export interface UserMetricsCreateBody {
    dob: string
    weight: number
    height: number
    sex: SEX
    activityLevel: ACTIVITY_LEVEL
}
