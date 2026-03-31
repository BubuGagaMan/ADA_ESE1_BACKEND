export const updateMealSchema = {
    params: {
        type: 'object',
        required: ['mealId'],
        properties: {
            mealId: { type: 'string', format: 'uuid' },
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

export const getMealSchema = {
    params: {
        type: 'object',
        required: ['mealId'],
        properties: {
            mealId: {
                type: 'string',
                format: 'uuid',
            },
        },
    },
}

export const addFoodToMealSchema = {
    params: {
        type: 'object',
        required: ['mealId', 'foodId'],
        properties: {
            mealId: { type: 'string', format: 'uuid' },
            foodId: { type: 'string', format: 'uuid' },
        },
    },
    body: {
        type: 'object',
        required: ['weight'],
        properties: {
            weight: {
                type: 'number',
                minimum: 10, // grams * 10 - to avoid fractional issues
                // maximum: 5000, // possibly add in future, keeping it open and free for now
            },
        },
    },
}

export const deleteMealFoodSchema = {
    params: {
        type: 'object',
        required: ['mealId', 'mealFoodId'],
        properties: {
            mealId: { type: 'string', format: 'uuid' },
            mealFoodId: { type: 'string', format: 'uuid' },
        },
    },
}
