import test, { TestContext } from 'node:test'

import { buildApp } from '@src/app.js'

import { equal } from 'node:assert/strict'

import userLogin from '@tests/functions/userLogin.js'

import { ACTIVITY_LEVEL, UserMetrics } from '@db/entities/user_metrics/UserMetrics.entity.js'
import { User } from '@db/entities/user/User.entity.js'
import registerNewUser from '@tests/functions/registerNewUser.js'
import testSeedDB from '@tests/testSeedDB.js'

// import bcrypt from "bcrypt";

test('UserMetrics.test.ts', async (t: TestContext) => {
    // SETUP
    const app = await buildApp()
    t.after(async () => {
        await app.close()
    })
    await testSeedDB(app)

    const registerBody = {
        username: 'newUser',
        email: 'newUser@email.com',
        password: 'Tt123456789!',
    }

    const { finalRegisterResponseJSON } = await registerNewUser(app, registerBody)

    const user1 = finalRegisterResponseJSON.data
    user1.password = registerBody.password

    const { loginResponseJSON } = await userLogin(app, user1.username, user1.password)

    const accessToken = loginResponseJSON.data.accessToken

    const userMetricsCreationPayload = {
        height: 1500,
        weight: 1000,
        sex: 0,
        dob: '2002-02-02',
        activity_level: ACTIVITY_LEVEL.MODERATELY_ACTIVE,
    }

    await t.test('Can create user metrics for user', async (_createUserMetricsTest: TestContext) => {
        const createUserMetricsResponse = await app.inject({
            method: 'POST',
            url: '/user-metrics',
            payload: userMetricsCreationPayload,
            headers: {
                'access-token': accessToken,
            },
        })
        const createUserMetricsResponseJSON = await createUserMetricsResponse.json()
        equal(createUserMetricsResponse.statusCode, 201)
        equal(createUserMetricsResponseJSON.message, 'Successfully created new user metrics for user')
    })

    await t.test(
        'Cannot POST/CREATE second user metrics for a user which already has one',

        async (_createUserMetricsTest2: TestContext) => {
            const createUserMetricsResponse = await app.inject({
                method: 'POST',
                url: '/user-metrics',
                payload: userMetricsCreationPayload,
                headers: {
                    'access-token': accessToken,
                },
            })
            const createUserMetricsResponseJSON = await createUserMetricsResponse.json()
            equal(createUserMetricsResponse.statusCode, 500)
            equal(createUserMetricsResponseJSON.hasOwnProperty('error'), true)
        },
    )

    await t.test('Can GET user metrics for a given user', async () => {
        const getUserMetricsResponse = await app.inject({
            method: 'GET',
            url: '/user-metrics',
            headers: {
                'access-token': accessToken,
            },
        })
        const getUserMetricsResponseJSON = await getUserMetricsResponse.json()
        equal(getUserMetricsResponse.statusCode, 200)
        equal(getUserMetricsResponseJSON.data.userMetrics.height, userMetricsCreationPayload.height)
        equal(getUserMetricsResponseJSON.data.userMetrics.weight, userMetricsCreationPayload.weight)
        equal(getUserMetricsResponseJSON.data.userMetrics.sex, userMetricsCreationPayload.sex)
        equal(getUserMetricsResponseJSON.data.userMetrics.dob, userMetricsCreationPayload.dob)
        equal(
            Number(getUserMetricsResponseJSON.data.userMetrics.activity_level),
            userMetricsCreationPayload.activity_level,
        )
    })

    await t.test('Can PUT/EDIT metrics for a given user', async () => {
        const putPayload = {
            height: 1200,
            weight: 800,
            sex: 0,
            dob: '2002-02-02',
            activity_level: ACTIVITY_LEVEL.LIGHTLY_ACTIVE,
        }
        const putUserMetricsResponse = await app.inject({
            method: 'PUT',
            url: '/user-metrics',
            headers: {
                'access-token': accessToken,
            },
            payload: putPayload,
        })
        const putUserMetricsResponseJSON = await putUserMetricsResponse.json()

        equal(putUserMetricsResponse.statusCode, 200)
        equal(putUserMetricsResponseJSON.data.height, putPayload.height)
        equal(putUserMetricsResponseJSON.data.weight, putPayload.weight)
        equal(putUserMetricsResponseJSON.data.sex, putPayload.sex)
        equal(putUserMetricsResponseJSON.data.dob, putPayload.dob)
        equal(Number(putUserMetricsResponseJSON.data.activity_level), putPayload.activity_level)
    })

    await t.test('Deleting a user also deletes their user metrics', async () => {
        const userWithMetric = await app.db.manager.findOne(User, {
            where: { id: user1.id },
        })
        if (userWithMetric) {
            const userMetric = await app.db.manager.findOne(UserMetrics, {
                where: { user: userWithMetric },
            })
            await app.inject({
                method: 'DELETE',
                url: '/user',
                headers: {
                    'access-token': accessToken,
                },
            })

            const deletedUserMetric = await app.db.manager.findOne(UserMetrics, {
                where: { id: userMetric?.id },
            })

            const deletedUserWithMetric = await app.db.manager.findOne(User, {
                where: { id: user1.id },
            })

            equal(deletedUserMetric, null)
            equal(deletedUserWithMetric, null)
        }
    })
})
