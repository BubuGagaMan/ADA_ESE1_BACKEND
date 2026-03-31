export interface CreateMealRequest {
    Body: { name: string }
    Params: { dietId: string }
}

export interface UpdateMealRequest {
    Body: { name: string }
    Params: { mealId: string }
}

export interface GetMealByIdRequest {
    Params: { mealId: string }
}
