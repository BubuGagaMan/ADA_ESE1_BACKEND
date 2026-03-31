import test, { TestContext } from 'node:test'

import { buildApp } from '@src/app.js'

import { equal } from 'node:assert/strict'

import { execSync } from 'child_process'

import { usersArr } from '@db/fixturesAndSeeds/user/user.fixtures.js'
import userLogin from '@tests/functions/userLogin.js'
import testSeedDB from '@tests/testSeedDB.js'

execSync(`npm run db:seed`, { stdio: 'inherit' })

// import bcrypt from "bcrypt";

test('auth cycle test', async (t: TestContext) => {
    // SETUP
    const app = await buildApp()
    t.after(async () => {
        await app.close()
    })
    await testSeedDB(app)

    const redis = app.redis
    await redis.flushdb()

    // the default password in the fixtures... (needed as the fixtures have PWs hashed)
    const parsedPasswordHash = 'Pp123456789!'

    const adminUser = usersArr[0]
    adminUser.password = parsedPasswordHash
    const defaultRoleUser = usersArr[1]
    defaultRoleUser.password = parsedPasswordHash

    let adminAccessToken = ''

    await t.test('Admin user can get all users', async () => {
        const { loginResponseJSON } = await userLogin(app, adminUser.username, adminUser.password)

        adminAccessToken = (await loginResponseJSON).data.accessToken

        const getAllUsersResponse = await app.inject({
            method: 'GET',
            url: '/get-all-users',
            headers: {
                'access-token': adminAccessToken,
            },
        })

        const getAllUsersResponseJSON = await getAllUsersResponse.json()

        equal(getAllUsersResponseJSON.message, 'Successfully retrieved users!')
        equal(getAllUsersResponseJSON.data.meta.totalItems, 2)
    })

    await t.test('Admin user can suspend other users', async (t2: TestContext) => {
        await t2.test('user_base1 CAN login initially (not suspended)', async () => {
            const { loginResponse } = await userLogin(app, defaultRoleUser.username, defaultRoleUser.password)
            equal(await loginResponse.json().message, 'User successfully validated on login.')
        })
        await t2.test('Admin suspension action on user_base1 returns a successful response', async () => {
            console.log('ACCESS TOKEN', adminAccessToken)
            const suspendUserRes = await app.inject({
                method: 'POST',
                url: '/swap-suspend-status/' + defaultRoleUser.id,
                headers: {
                    'access-token': adminAccessToken,
                },
                body: {
                    message: 'You have been suspended',
                },
            })

            const suspendUserJSON = await suspendUserRes.json()
            equal(suspendUserJSON.message, 'User ban status successfully swapped')
            equal(suspendUserJSON.data.username, 'user_base1')
            equal(suspendUserJSON.data.suspended, true)
        })

        await t2.test('user_base1 CANNOT login post suspension ', async () => {
            const { loginResponse } = await userLogin(app, defaultRoleUser.username, defaultRoleUser.password)
            equal(loginResponse.json().error, 'Error occurred while attempting user login.')
            equal(loginResponse.json().message, 'Account suspended')
        })
    })
})
