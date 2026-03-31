import { FastifyRedis } from '@fastify/redis'
import { EmailConfirmationEnum } from './emailConfirmationTypes.js'
import { generateRandom6CharCode } from '@services/utils/random6CharCode.js'

export const cacheConfirmation = async (
    confirmaitonType: EmailConfirmationEnum,
    redis: FastifyRedis,
    cacheValue: string, // stringified object!
) => {
    const redisKeyPreset = confirmaitonType.split(' ').join('_')

    const maxRetries = 5
    let attempts = 0
    let isSaved = false

    let redisKey = ''
    let confirmationCode = ''

    while (attempts < maxRetries && !isSaved) {
        const code = generateRandom6CharCode()
        const key = `confirmation:${redisKeyPreset}:${code}`
        const result = await redis.set(
            key,
            cacheValue,
            'EX',
            Number(process.env.REDIS_EMAIL_EXPIRY) || 900, // 15 min (in sec)
            'NX', // check for non-pre-existing key
        )

        if (result === 'OK') {
            isSaved = true
            confirmationCode = code
            redisKey = key
        } else {
            attempts++
        }
    }

    if (!isSaved) {
        throw new Error('Could not generate a unique confirmation code after 5 attempts.')
    }

    return { redisKey, confirmationCode }
}
