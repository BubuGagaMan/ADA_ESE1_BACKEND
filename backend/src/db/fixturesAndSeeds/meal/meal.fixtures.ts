export type MealFoodFixture = {
    foodId: string
    weight: number // grams * 10
}

export type MealData = {
    id: string
    dietId: string
    name: string
    carbohydrates: number
    proteins: number
    fats: number
    fiber: number
    calories: number
    glycemic_load: number
    foodItems: MealFoodFixture[]
}

export const mealsArr: MealData[] = [
    {
        id: '11111111-2222-3333-4444-555555555555',
        dietId: '99999999-9999-4999-a999-999999999999', // fitness_guru diet 1
        name: 'meal 1 diet 1',
        carbohydrates: 680,
        fiber: 269,
        proteins: 677,
        fats: 1017,
        calories: 14622,
        glycemic_load: 323,
        foodItems: [
            { foodId: '9986eadd-ae14-44a6-9888-864cdce8a463', weight: 1200 }, // 120g apple wiht skin
            { foodId: 'b8cb1b1d-07b1-45e8-bb65-ac1d335dd510', weight: 2000 }, // 200g  greek yoghurt
            { foodId: '6bc28913-4bd6-4c05-ad56-eb7190934b50', weight: 2000 }, // 200g almonds, raw
            { foodId: 'b7397c2f-5e16-4a3b-be42-d37cb0227d69', weight: 750 }, // 75g chicken
        ],
    },
    {
        id: '33333333-3333-4333-a333-333333333333',
        dietId: '33333333-3333-4333-a333-333333333333', // user_base1 diet 1
        name: 'meal 1 diet 1',
        carbohydrates: 680,
        fiber: 269,
        proteins: 677,
        fats: 1017,
        calories: 14622,
        glycemic_load: 323,
        foodItems: [
            { foodId: '9986eadd-ae14-44a6-9888-864cdce8a463', weight: 1200 }, // 120g apple wiht skin
            { foodId: 'b8cb1b1d-07b1-45e8-bb65-ac1d335dd510', weight: 2000 }, // 200g  greek yoghurt
            { foodId: '6bc28913-4bd6-4c05-ad56-eb7190934b50', weight: 2000 }, // 200g almonds, raw
            { foodId: 'b7397c2f-5e16-4a3b-be42-d37cb0227d69', weight: 750 }, // 75g chicken
        ],
    },
]
