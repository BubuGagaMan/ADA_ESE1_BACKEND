import { WEIGHT_GOAL } from '@db/entities/diet/Diet.entity.js'
import { UserMetricsFormRequest } from '@services/types/servicePayloadTypes/diet.service.payload.type.js'

function calculateAge(dobString: string) {
    const birthday = new Date(dobString)
    const today = new Date()

    let age = today.getFullYear() - birthday.getFullYear()
    const monthDifference = today.getMonth() - birthday.getMonth()

    // If the current month is before the birth month,
    // or if it's the birth month but the day hasn't passed yet, subtract a year.
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthday.getDate())) {
        age--
    }

    return age
}

type NutritionBoundaries = {
    carbohydrate_lower_range: number
    carbohydrate_upper_range: number
    protein_lower_range: number
    protein_upper_range: number
    fat_lower_range: number
    fat_upper_range: number
    daily_calorie_target?: number
}

type MacroBoundariesKey =
    | 'carbohydrate_lower_range'
    | 'carbohydrate_upper_range'
    | 'protein_lower_range'
    | 'protein_upper_range'
    | 'fat_lower_range'
    | 'fat_upper_range'

const CALORIES_PER_GRAM_PROTEIN_OR_CARB = 4
const CALORIES_PER_GRAM_FAT = 9

const computeNutritionBoundaries = (boundariesObject: NutritionBoundaries, dailyCalories: number) => {
    const newObject = { ...boundariesObject }

    for (const key in newObject) {
        const marcoPortionOfTotalCalories = newObject[key as MacroBoundariesKey] * dailyCalories

        const macro = key.split('_')[0]

        if (macro === 'carbohydrate' || macro === 'protein') {
            newObject[key as MacroBoundariesKey] = Math.round(
                marcoPortionOfTotalCalories / CALORIES_PER_GRAM_PROTEIN_OR_CARB,
            )
        }
        // if not carbs or protein - key is fats
        else {
            newObject[key as MacroBoundariesKey] = Math.round(marcoPortionOfTotalCalories / CALORIES_PER_GRAM_FAT)
        }
    }

    newObject.daily_calorie_target = dailyCalories

    return newObject
}

export const computeDailyNutrition = (userMetrics: UserMetricsFormRequest, weightGoal: WEIGHT_GOAL) => {
    const age = calculateAge(userMetrics.dob)
    const goalCalorieAdjustment = weightGoal * 275

    const cuttingMacroBoundaries = {
        carbohydrate_lower_range: 0.48,
        carbohydrate_upper_range: 0.65,
        protein_lower_range: 0.2,
        protein_upper_range: 0.27,
        fat_lower_range: 0.15,
        fat_upper_range: 0.25,
    }

    const bulkAndMaintenanceMacros = {
        carbohydrate_lower_range: 0.45,
        carbohydrate_upper_range: 0.65,
        protein_lower_range: 0.15,
        protein_upper_range: 0.2,
        fat_lower_range: 0.2,
        fat_upper_range: 0.35,
    }

    // MALES
    if (userMetrics.sex === 0) {
        const BMR = (10 * userMetrics.weight + 6.25 * userMetrics.height + 5 * age + 5) * userMetrics.activity_level

        const dailyCalorieTarget = Math.trunc(BMR + goalCalorieAdjustment)

        const dailyNutrition =
            weightGoal < 0
                ? computeNutritionBoundaries(cuttingMacroBoundaries, dailyCalorieTarget)
                : computeNutritionBoundaries(bulkAndMaintenanceMacros, dailyCalorieTarget)

        return dailyNutrition
    }
    // FEMALES
    if (userMetrics.sex === 1) {
        const BMR = (10 * userMetrics.weight + 6.25 * userMetrics.height + 5 * age - 161) * userMetrics.activity_level

        const dailyCalorieTarget = Math.trunc(BMR + goalCalorieAdjustment)

        const dailyNutrition =
            weightGoal < 0
                ? computeNutritionBoundaries(cuttingMacroBoundaries, dailyCalorieTarget)
                : computeNutritionBoundaries(bulkAndMaintenanceMacros, dailyCalorieTarget)

        return dailyNutrition
    }

    throw new Error('User metrics do not have a sex == 1 || sex == 0 property when trying to calculate diet targets')
}
