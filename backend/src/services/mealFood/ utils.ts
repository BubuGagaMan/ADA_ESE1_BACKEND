import { Food } from '@db/entities/food/Food.entity.js'

interface FoodContents {
    carbohydrates: number
    proteins: number
    fiber: number
    fats: number
}

export const contentPer100g = (content: number, weight: number) => {
    return Math.round((content * weight) / 1000)
}

export const calculateFoodContentsPer100g = (food: Food, foodWeight: number): FoodContents => {
    const { carbohydrates, proteins, fiber, fats } = food

    return {
        carbohydrates: contentPer100g(carbohydrates, foodWeight),
        proteins: contentPer100g(proteins, foodWeight),
        fats: contentPer100g(fats, foodWeight),
        fiber: contentPer100g(fiber, foodWeight),
    }
}
