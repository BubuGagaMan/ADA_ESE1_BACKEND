import { WEIGHT_GOAL } from '@db/entities/diet/Diet.entity.js'

export type DietData = {
    id: string
    userId: string
    name: string
    calories: number // kcal * 10
    carbohydrates: number // micrograms (or your specific int scaling)
    proteins: number
    fats: number
    fiber: number
    carbohydrate_lower_range: number
    carbohydrate_upper_range: number
    protein_lower_range: number
    protein_upper_range: number
    fat_lower_range: number
    fat_upper_range: number
    daily_calorie_target: number
    weight_goal: WEIGHT_GOAL
}

export const dietsArr: DietData[] = [
    {
        id: '99999999-9999-4999-a999-999999999999',
        userId: '66666666-6666-4666-a666-666666666666', // fitness_guru (ADMIN role)
        name: 'diet1',
        calories: 14622,
        carbohydrates: 680,
        proteins: 677,
        fats: 1017,
        fiber: 269,
        carbohydrate_lower_range: 3238,
        carbohydrate_upper_range: 4677,
        protein_lower_range: 1079,
        protein_upper_range: 1439,
        fat_lower_range: 640,
        fat_upper_range: 1119,
        daily_calorie_target: 28779,
        weight_goal: 0,
    },
    {
        id: '33333333-3333-4333-a333-333333333333',
        userId: '77777777-7777-4777-a777-777777777777', // user_base1 (BASE_USER role)
        name: 'diet1',
        calories: 14622,
        carbohydrates: 680,
        proteins: 677,
        fats: 1017,
        fiber: 269,
        carbohydrate_lower_range: 3238,
        carbohydrate_upper_range: 4677,
        protein_lower_range: 1079,
        protein_upper_range: 1439,
        fat_lower_range: 640,
        fat_upper_range: 1119,
        daily_calorie_target: 28779,
        weight_goal: 0,
    },
]
