import { Food } from '@db/entities/food/Food.entity.js'

function calculateFoodGL(carbohydrates: number, fiber: number, glycemicIndex: number) {
    const netCabs = carbohydrates - fiber
    const foodGL = (glycemicIndex * netCabs) / 100

    return foodGL
}

function calculateBaseMealGL(foods: Food[]) {
    let GLSum = 0

    for (const food of foods) {
        const foodGL = calculateFoodGL(food.carbohydrates, food.fiber, food.glycemic_index)

        GLSum += foodGL
    }

    return GLSum
}

export function calculateGL(foods: Food[], totalMealFats: number, totalMealProteins: number) {
    const baseMealGL = calculateBaseMealGL(foods)

    // fat reduces gl by 0.8% per gram of fats
    const FAT_FACTOR = 0.008
    // protein reduces gl by 1.5% per gram of proteins
    const PROTEIN_FACTOR = 0.015

    // const totalMealFats = calculateTotalMealMacro(foods, "fats")
    // const totalMealProteins = calculateTotalMealMacro(foods, "proteins")

    // REMEMBER - MACROS (FATS/PROTEINS) NEED TO BE DIVIDED BY 10 TO ADJUST FROM DB RECORDS
    const totalFatImpact = (FAT_FACTOR * totalMealFats) / 10
    const totalProteinImpact = (PROTEIN_FACTOR * totalMealProteins) / 10

    let totalDampingFactor = 1 - (totalFatImpact + totalProteinImpact)
    if (totalDampingFactor < 0.5) totalDampingFactor = 0.5

    const finalMealGL = baseMealGL * totalDampingFactor

    return finalMealGL >= 0 ? finalMealGL : 0
}
