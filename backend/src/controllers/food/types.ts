export interface CreateFoodRequest {
    Body: {
        name: string
        carbohydrates: string
        fiber: string
        proteins: string
        fats: string
        calories: string
        weight: string
        glycemic_index: string
    }
}
