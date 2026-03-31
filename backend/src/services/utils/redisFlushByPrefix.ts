import { FastifyRedis } from '@fastify/redis'

async function redisFlushByPrefix(prefix: string, redis: FastifyRedis) {
    const stream = redis.scanStream({
        match: `${prefix}*`,
        count: 100,
    })

    stream.on('data', async (keys: string[]) => {
        if (keys.length > 0) {
            // pipeline the deletes for better performance
            const pipeline = redis.pipeline()
            keys.forEach((key) => pipeline.del(key))
            await pipeline.exec()
        }
    })

    return new Promise((resolve, reject) => {
        stream.on('end', resolve)
        stream.on('error', reject)
    })
}

export default redisFlushByPrefix
