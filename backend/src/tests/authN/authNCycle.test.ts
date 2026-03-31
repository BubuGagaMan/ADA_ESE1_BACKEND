import test, { TestContext } from 'node:test'

import { buildApp } from '@src/app.js'

import { equal } from 'node:assert/strict'

import { usersArr } from '@db/fixturesAndSeeds/user/user.fixtures.js'
import isPasswordCorrect from '@tests/functions/isPasswordCorrect.js'
import registerNewUser from '@tests/functions/registerNewUser.js'
import { EmailConfirmationEnum } from '@services/auth/emailConfirmation/emailConfirmationTypes.js'

import { User } from '@db/entities/user/User.entity.js'
import { generateRandom6CharCode } from '@services/utils/random6CharCode.js'
import bcryptHash from '@utilities/bcryptHash.js'
import testSeedDB from '@tests/testSeedDB.js'

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

    await t.test('User can successfully register', async () => {
        const registerBody = {
            username: 'newUser',
            email: 'newUser@email.com',
            password: 'Tt123456789!',
        }

        const { finalRegisterResponseJSON } = await registerNewUser(app, registerBody)

        equal(finalRegisterResponseJSON.message, 'User registered successfully.')
        equal(finalRegisterResponseJSON.data.username, registerBody.username)

        const isUserPassword = await isPasswordCorrect(registerBody.password, finalRegisterResponseJSON.data.password)

        equal(isUserPassword, true)
    })

    const user1 = usersArr[0]

    // create a user
    const postBody = {
        username: user1.username,
        email: user1.email,
        password: 'Pp123456789!',
    }

    const loginResponse = await app.inject({
        method: 'POST',
        url: '/login',
        payload: { username: postBody.username, password: postBody.password },
    })

    await t.test('User successfully logs in with correct credentials', () => {
        equal(loginResponse.json().message, 'User successfully validated on login.')
    })

    const getAllResponse = await app.inject({
        method: 'GET',
        url: '/user',
        headers: {
            'access-token': loginResponse.json().data.accessToken,
        },
    })

    await t.test('User profile can be accessed with correct token', () => {
        if (getAllResponse.json().message !== 'User successfully retrieved!') {
            throw new Error('Users not retrieved, even with correct token')
        }
    })
    const getAllResponseNoToken = await app.inject({
        method: 'GET',
        url: '/user',
        headers: {
            'access-token': 'wrong token',
        },
    })

    await t.test('Providing wrong token yields an error when trying to fetch user profile', () => {
        if (getAllResponseNoToken.json().error !== 'Failure during authorisation') {
            throw new Error('Able to get all users without an access token')
        }
    })

    // remember that the codes need to be manually generated... as sending confirmation emails might not work over internet
    await t.test('User can change username', async () => {
        const newUsername = 'renamedUser'
        const newCode = generateRandom6CharCode()
        await app.redis.set(`confirmation:username_change:${newCode}`, JSON.stringify({ username: newUsername }))

        await app.inject({
            method: 'PUT',
            url: '/user',
            headers: {
                'access-token': loginResponse.json().data.accessToken,
            },
            payload: {
                confirmationCode: newCode,
                confirmationType: EmailConfirmationEnum.USERNAME_CHANGE,
            },
        })

        const userRes = await app.inject({
            method: 'GET',
            url: '/user',
            headers: {
                'access-token': loginResponse.json().data.accessToken,
            },
        })

        equal(userRes.json().data.user.username, newUsername)
    })

    await t.test('User can change email', async () => {
        const newEmail = 'changedEmail@email.com'
        const newCode = generateRandom6CharCode()
        await app.redis.set(`confirmation:email_change:${newCode}`, JSON.stringify({ email: newEmail }))

        await app.inject({
            method: 'PUT',
            url: '/user',
            headers: {
                'access-token': loginResponse.json().data.accessToken,
            },
            payload: {
                confirmationCode: newCode,
                confirmationType: EmailConfirmationEnum.EMAIL_CHANGE,
            },
        })

        const userRes = await app.inject({
            method: 'GET',
            url: '/user',
            headers: {
                'access-token': loginResponse.json().data.accessToken,
            },
        })
        equal(userRes.json().data.user.email, newEmail)
    })

    await t.test('User can change password', async () => {
        const newPassword = 'newPassword1!'

        const newCode = generateRandom6CharCode()
        await app.redis.set(
            `confirmation:password_reset:${newCode}`,
            JSON.stringify({ password: await bcryptHash(newPassword, 1) }),
        )

        await app.inject({
            method: 'PUT',
            url: '/user',
            headers: {
                'access-token': loginResponse.json().data.accessToken,
            },
            payload: {
                confirmationCode: newCode,
                confirmationType: EmailConfirmationEnum.PASSWORD_RESET,
            },
        })

        await app.inject({
            method: 'GET',
            url: '/user',
            headers: {
                'access-token': loginResponse.json().data.accessToken,
            },
        })
        const dbNewPasswordHash = (await app.db.manager.findOneBy(User, { id: user1.id }))?.password

        const isNewPasswordCorrect = await isPasswordCorrect(newPassword, dbNewPasswordHash ?? '')
        equal(isNewPasswordCorrect, true)
    })

    await app.redis.flushdb()
})
