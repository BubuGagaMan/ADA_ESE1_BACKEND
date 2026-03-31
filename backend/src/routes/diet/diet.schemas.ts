import { WEIGHT_GOAL } from '@db/entities/diet/Diet.entity.js'
import { ACTIVITY_LEVEL, SEX } from '@db/entities/user_metrics/UserMetrics.entity.js'

export const getOneDietSchema = {
    params: {
        type: 'object',
        required: ['dietId'],
        properties: {
            dietId: {
                type: 'string',
                format: 'uuid',
            },
        },
    },
}

const weightGoalValues = Object.values(WEIGHT_GOAL)

const MAX_DIET_NAME_LENGTH = 24
const MIN_DIET_NAME_LENGTH = 3
export const createDietSchema = {
    body: {
        type: 'object',
        required: ['weightGoal', 'name'],
        properties: {
            weightGoal: {
                type: 'number',
                enum: weightGoalValues,
            },
            name: {
                type: 'string',
                minLength: MIN_DIET_NAME_LENGTH,
                maxLength: MAX_DIET_NAME_LENGTH,
                pattern: '^\\S+(?: \\S+)*$', // allows spaces BETWEEN words, but not at start/end
            },
        },
    },
}

export const updateDietSchema = {
    params: {
        type: 'object',
        required: ['dietId'],
        properties: {
            dietId: { type: 'string', format: 'uuid' },
        },
    },
    body: {
        type: 'object',
        required: ['weightGoal', 'name', 'userMetrics'],
        properties: {
            weightGoal: { type: 'number', enum: weightGoalValues },
            name: { type: 'string', minLength: MIN_DIET_NAME_LENGTH, maxLength: MAX_DIET_NAME_LENGTH },
            userMetrics: {
                type: 'object',
                required: ['height', 'weight', 'sex', 'dob', 'activity_level'],
                properties: {
                    height: { type: 'number', minimum: 1200, maximum: 3000 }, // cm * 10 (to avoid fractional errors)
                    weight: { type: 'number', minimum: 400, maximum: 3000 }, // kg * 10
                    sex: { type: 'number', enum: Object.values(SEX) },
                    dob: { type: 'string', format: 'date' },
                    activity_level: {
                        type: 'number',
                        enum: Object.values(ACTIVITY_LEVEL),
                    },
                },
            },
        },
    },
}

export const createMealSchema = {
    params: {
        type: 'object',
        required: ['dietId'],
        properties: {
            dietId: { type: 'string', format: 'uuid' },
        },
    },
    body: {
        type: 'object',
        required: ['name'],
        properties: {
            name: {
                type: 'string',
                minLength: 3,
                maxLength: 24,
                pattern: '^\\S+(?: \\S+)*$',
            },
        },
    },
}
