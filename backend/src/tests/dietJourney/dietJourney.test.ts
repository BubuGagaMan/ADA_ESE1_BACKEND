import test, { TestContext } from 'node:test'

import { buildApp } from '@src/app.js'

import { equal } from 'node:assert/strict'

import { execSync } from 'child_process'
import userLogin from '@tests/functions/userLogin.js'

import registerNewUser from '@tests/functions/registerNewUser.js'
import { WEIGHT_GOAL } from '@db/entities/diet/Diet.entity.js'
import { usersArr } from '@db/fixturesAndSeeds/user/user.fixtures.js'
import { dietsArr } from '@db/fixturesAndSeeds/diet/diet.fixtures.js'
import { mealsArr } from '@db/fixturesAndSeeds/meal/meal.fixtures.js'
import testSeedDB from '@tests/testSeedDB.js'

execSync(`npm run db:seed`, { stdio: 'inherit' })

// import bcrypt from "bcrypt";

// create a diet -> add meals -> add food to meals -> delete 1 meal food -> delete 1 meeal -> delete diet

test('User can create/edit a diet, add/edit a meal and a food to meal, as well as delete each', async (t: TestContext) => {
    // SETUP
    const app = await buildApp()
    t.after(async () => {
        await app.close()
    })
    await testSeedDB(app)

    const newUser = {
        email: 'newUser@email.com',
        username: 'newUser',
        password: 'Pp123456789!',
    }

    await registerNewUser(app, newUser)

    const { loginResponseJSON } = await userLogin(app, newUser.username, newUser.password)

    const token = loginResponseJSON.data.accessToken

    const adminUserMetrics = usersArr[0].metrics

    await app.inject({
        method: 'POST',
        url: '/user-metrics',
        payload: adminUserMetrics,
        headers: {
            'access-token': token,
        },
    })

    // diet made by the same user metrics fixtures ( but with added foods)
    const adminDiet = dietsArr[0]

    const expectedDietRanges = {
        calories: 0,
        carbohydrates: 0,
        proteins: 0,
        fats: 0,
        fiber: 0,
        carbohydrate_lower_range: adminDiet.carbohydrate_lower_range,
        carbohydrate_upper_range: adminDiet.carbohydrate_upper_range,
        protein_lower_range: adminDiet.protein_lower_range,
        protein_upper_range: adminDiet.protein_upper_range,
        fat_lower_range: adminDiet.fat_lower_range,
        fat_upper_range: adminDiet.fat_upper_range,
        daily_calorie_target: adminDiet.daily_calorie_target,
    }

    let dietId = ''

    await t.test('Can create a new diet', async () => {
        const createDietPayload = {
            weightGoal: WEIGHT_GOAL.MAINTENANCE,
            name: 'diet1',
        }
        const createDietJSON = await (
            await app.inject({
                method: 'POST',
                url: '/diet',
                headers: {
                    'access-token': token,
                },
                payload: createDietPayload,
            })
        ).json()

        dietId = createDietJSON.data.id

        equal(createDietJSON.message, 'New diet successfully created for user')
        equal(createDietJSON.data.name, createDietPayload.name)
        equal(createDietJSON.data.weight_goal, createDietPayload.weightGoal)

        for (const key in expectedDietRanges) {
            const k = key as keyof typeof expectedDietRanges
            equal(createDietJSON.data[k], expectedDietRanges[k])
        }
    })

    await t.test('Can edit diet and read a diet', async (t2: TestContext) => {
        const editDietPayload = {
            weightGoal: WEIGHT_GOAL.GAIN_250_GRAMS,
            name: 'renamedDiet1',
        }

        await t2.test('Can edit diet successfully', async () => {
            const editDietJSON = await (
                await app.inject({
                    method: 'PUT',
                    url: '/diet/' + dietId,
                    headers: {
                        'access-token': token,
                    },
                    payload: editDietPayload,
                })
            ).json()

            equal(editDietJSON.message, 'Successfully updated diet')
        })

        await t2.test('Updates reflected in new read', async () => {
            const readDietJSON = await (
                await app.inject({
                    method: 'GET',
                    url: '/diet/' + dietId,
                    headers: {
                        'access-token': token,
                    },
                    payload: editDietPayload,
                })
            ).json()

            equal(readDietJSON.message, 'Successfully retrieved diet')

            equal(readDietJSON.data.name, editDietPayload.name)
            equal(readDietJSON.data.weight_goal, editDietPayload.weightGoal)
        })

        // edit diet back for next tests... so it cna be checked agains the fixtures values
        await app.inject({
            method: 'PUT',
            url: '/diet/' + dietId,
            headers: {
                'access-token': token,
            },
            payload: {
                weightGoal: WEIGHT_GOAL.MAINTENANCE,
                name: 'diet1',
            },
        })
    })

    let mealId = ''
    await t.test('Can add, edit and read a meal within a diet', async (t2: TestContext) => {
        const createMealPayload = {
            name: 'meal1',
        }
        const updateMealPayload = {
            name: 'meal1renamed',
        }

        await t2.test('Can add a meal to a diet', async () => {
            const createMealJSON = await (
                await app.inject({
                    method: 'POST',
                    url: `/diet/${dietId}/meal`,
                    headers: {
                        'access-token': token,
                    },
                    payload: createMealPayload,
                })
            ).json()

            mealId = createMealJSON.data.id
            equal(createMealJSON.message, 'Successfully created a new meal for user diet')
            equal(createMealJSON.data.name, createMealPayload.name)
            equal(createMealJSON.data.carbohydrates, 0)
            equal(createMealJSON.data.fiber, 0)
            equal(createMealJSON.data.proteins, 0)
            equal(createMealJSON.data.fats, 0)
            equal(createMealJSON.data.calories, 0)
            equal(createMealJSON.data.glycemic_load, 0)
        })
        await t2.test('Can edit a meal', async () => {
            const updateMealJSON = await (
                await app.inject({
                    method: 'PUT',
                    url: `/meal/${mealId}`,
                    headers: {
                        'access-token': token,
                    },
                    payload: updateMealPayload,
                })
            ).json()

            equal(updateMealJSON.message, 'Successfully updated meal')
        })
        await t2.test('Can read all meals for a diet', async () => {
            const readMealsJSON = await (
                await app.inject({
                    method: 'GET',
                    url: `/diet/${dietId}/meal`,
                    headers: {
                        'access-token': token,
                    },
                })
            ).json()

            equal(readMealsJSON.message, 'Successfully fetched all meals for a diet')
            equal(readMealsJSON.data[0].name, updateMealPayload.name)
            equal(readMealsJSON.data[0].id, mealId)
        })

        // rename meal back for easy access in remaining tests...
        await app.inject({
            method: 'PUT',
            url: `/diet/${dietId}/meal`,
            headers: {
                'access-token': token,
            },
            payload: createMealPayload,
        })
    })

    const adminMeal = mealsArr[0]
    const adminMealFoods = adminMeal.foodItems

    await t.test('Can add foods to a meal, retrive all the foods and delete them', async (t2: TestContext) => {
        await t2.test('Can add foods to a meal', async () => {
            for (const food of adminMealFoods) {
                const addMealFoodJSON = await (
                    await app.inject({
                        method: 'POST',
                        url: `/meal/${mealId}/food/${food.foodId}`,
                        headers: {
                            'access-token': token,
                        },
                        payload: {
                            weight: food.weight,
                        },
                    })
                ).json()

                equal(addMealFoodJSON.message, 'Successfully added food to meal')
            }
        })

        // meal foods for later deletion
        const mealFoodIds: { id: string }[] = []
        await t2.test(
            'Can get all the foods from a meal - they should have the same values as the added ones',
            async () => {
                // the formerly created meal 1 with the now added foods
                const meal1 = await (
                    await app.inject({
                        method: 'GET',
                        url: `/diet/${dietId}/meal`,
                        headers: {
                            'access-token': token,
                        },
                    })
                ).json().data[0]

                // the figures shouldbe the same as the admin meal as same foods are added
                equal(meal1.carbohydrates, adminMeal.carbohydrates)
                equal(meal1.fiber, adminMeal.fiber)
                equal(meal1.proteins, adminMeal.proteins)
                equal(meal1.fats, adminMeal.fats)
                equal(meal1.calories, adminMeal.calories)
                equal(meal1.glycemic_load, adminMeal.glycemic_load)

                const meal1Foods = await (
                    await app.inject({
                        method: 'GET',
                        url: `/meal/${mealId}/meal-food`,
                        headers: {
                            'access-token': token,
                        },
                    })
                ).json()

                equal(meal1Foods.message, 'Successfully fetched all foods for a meal')

                for (const index in meal1Foods.data) {
                    mealFoodIds.push(meal1Foods.data[Number(index)].id)
                    equal(adminMealFoods[Number(index)].weight, meal1Foods.data[Number(index)].weight)
                    equal(adminMealFoods[Number(index)].foodId, meal1Foods.data[Number(index)].food.id)
                }
            },
        )
        await t2.test(
            'Can remove foods form a meal, meal should have no foods after, meal and diet should have no macros/calories',
            async (t3) => {
                for (const index in mealFoodIds) {
                    await app.inject({
                        method: 'DELETE',
                        url: `/meal/${mealId}/meal-food/${mealFoodIds[index]}`,
                        headers: {
                            'access-token': token,
                        },
                    })
                }

                const mealFoods = await (
                    await app.inject({
                        method: 'GET',
                        url: `/meal/${mealId}/meal-food`,
                        headers: {
                            'access-token': token,
                        },
                    })
                ).json()

                // meal foods arr should be empty
                equal(mealFoods.data.length, 0)

                await t3.test('Meal and diet should not have macros/GL/calories after food deletions', async () => {
                    const userDietJSON = await (
                        await app.inject({
                            method: 'get',
                            url: `/diet`,
                            headers: {
                                'access-token': token,
                            },
                        })
                    ).json().data[0]

                    const userMealJSON = await (
                        await app.inject({
                            method: 'GET',
                            url: `/diet/${dietId}/meal`,
                            headers: {
                                'access-token': token,
                            },
                        })
                    ).json().data[0]

                    equal(userMealJSON.glycemic_load, 0)

                    const macrosAndCaloriesKeys = ['fats', 'proteins', 'carbohydrates', 'fiber', 'calories']
                    for (const item of macrosAndCaloriesKeys) {
                        equal(userDietJSON[item], 0)
                        equal(userMealJSON[item], 0)
                    }
                })
            },
        )

        await t2.test('Can remove meal from diet', async () => {
            // note that this call will not return a body (is 204 status)
            await app.inject({
                method: 'DELETE',
                url: `/meal/${mealId}`,
                headers: {
                    'access-token': token,
                },
            })

            // meals data arr should be empty
            const dietJSON = await (
                await app.inject({
                    method: 'GET',
                    url: `/diet/${dietId}/meal`,
                    headers: {
                        'access-token': token,
                    },
                })
            ).json()

            equal(dietJSON.data.length, 0)
        })

        await t2.test('Can delete diet', async () => {
            await app.inject({
                method: 'DELETE',
                url: `/diet/${dietId}`,
                headers: {
                    'access-token': token,
                },
            })

            const userDietsJSON = await (
                await app.inject({
                    method: 'get',
                    url: `/diet`,
                    headers: {
                        'access-token': token,
                    },
                })
            ).json()
            equal(userDietsJSON.data.length, 0)
        })
    })

    // const { loginResponse, loginResponseJSON } = await userLogin(app, user1.username, user1.password)

    // const accessToken = (await loginResponseJSON).data.accessToken
    // const tokenPayload = await getTokenPayload(app, accessToken)

    // t.test('Can create a diet', async (t2: TestContext) => {
    //     const dietCreationPayload = {
    //         name: 'Fat loss',
    //         // dietGoal: WeightGoal.MAINTENANCE
    //     }
    //     const createDietResponse = app.inject({
    //         method: 'POST',
    //         url: '/diet/' + tokenPayload?.id,
    //         payload: dietCreationPayload,
    //         headers: {
    //             'access-token': accessToken,
    //         },
    //     })
    // })
})
