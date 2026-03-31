import { ACTIVITY_LEVEL, SEX } from '@db/entities/user_metrics/UserMetrics.entity.js'

export interface CreateUserMetricsRequest {
    Body: {
        height: number
        weight: number
        sex: SEX
        dob: string
        activity_level: ACTIVITY_LEVEL
    }
}
