export interface AddFoodToMealRequest {
    Params: { mealId: string; foodId: string }
    Body: { weight: number }
}

export interface DeleteMealFoodByIdRequest {
    Params: { mealId: string; mealFoodId: string }
}
