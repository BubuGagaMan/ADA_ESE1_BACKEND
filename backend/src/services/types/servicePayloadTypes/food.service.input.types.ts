export interface ICreateFoodData {
    name: string
    carbohydrates: number
    proteins: number
    fats: number
    weight: number
    glycemic_index: number
}

export type UpdateFoodProp = 'name' | 'carbohydrates' | 'proteins' | 'fats' | 'weight' | 'glycemic_index'
