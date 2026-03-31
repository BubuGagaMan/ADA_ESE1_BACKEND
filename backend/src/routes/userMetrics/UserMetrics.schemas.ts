import { ACTIVITY_LEVEL, SEX } from '@db/entities/user_metrics/UserMetrics.entity.js'

export const createUserMetricsSchema = {
    body: {
        type: 'object',
        required: ['height', 'weight', 'sex', 'dob', 'activity_level'],
        properties: {
            height: { type: 'number', minimum: 1200, maximum: 3000 },
            weight: { type: 'number', minimum: 400, maximum: 3000 },
            sex: {
                type: 'number',
                enum: Object.values(SEX),
            },
            dob: { type: 'string', format: 'date' },
            activity_level: {
                type: 'number',
                enum: Object.values(ACTIVITY_LEVEL),
            },
        },
    },
}
