import { generateRandom6CharCode } from '@services/utils/random6CharCode.js'
import redisFlushByPrefix from '@services/utils/redisFlushByPrefix.js'
import bcryptHash from '@utilities/bcryptHash.js'

type FastifyInstance = import('fastify').FastifyInstance

interface NewUserDetails {
    email: string
    username: string
    password: string
}

const registerNewUser = async (app: FastifyInstance, newUserDetails: NewUserDetails) => {
    await redisFlushByPrefix('confirmation:registration:', app.redis)

    // MUST SET REDIS CODE MANUALLY... SENDING EMAILS WILL NOT WORK IF INTERNET ISN'T PRESENT :/
    const newCode = generateRandom6CharCode()
    await app.redis.set(
        `confirmation:registration:${newCode}`,
        JSON.stringify({
            ...newUserDetails,
            password: await bcryptHash(newUserDetails.password, 11),
        }),
    )

    // now only confirming
    const registerResponse2 = await app.inject({
        method: 'POST',
        url: '/register',
        payload: { confirmationCode: newCode },
    })

    const registerResponse2JSON = await registerResponse2.json()

    return {
        finalRegisterResponse: registerResponse2,
        finalRegisterResponseJSON: registerResponse2JSON,
    }
}

export default registerNewUser
