import { FastifyRedis } from '@fastify/redis'

async function getRedisKeysByPrefix(prefix: string, redis: FastifyRedis): Promise<string[]> {
    const stream = redis.scanStream({
        match: `${prefix}*`,
        count: 100,
    })

    const keys: string[] = []

    return new Promise((resolve, reject) => {
        stream.on('data', (resultKeys: string[]) => {
            keys.push(...resultKeys)
        })
        stream.on('end', () => resolve(keys))
        stream.on('error', (err) => reject(err))
    })
}

export default getRedisKeysByPrefix
