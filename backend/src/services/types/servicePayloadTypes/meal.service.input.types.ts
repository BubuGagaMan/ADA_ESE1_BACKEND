import { IUserIdPayload } from './userId.payload.js'

export interface CreateMealData {
    name: string
    dietId: string
}

export interface IUpdateMealData {
    name: string
    mealId: string
}

export interface GetAllMealsForDietPayload extends IUserIdPayload {
    dietId: string
}

export interface UpdateMealByIdPayload extends IUserIdPayload {
    name: string
    mealId: string
}

export interface DeleteMealByIdPayload extends IUserIdPayload {
    mealId: string
}

export interface AddMealFoodPayload extends IUserIdPayload {
    foodId: string
    mealId: string
    weight: number
}
