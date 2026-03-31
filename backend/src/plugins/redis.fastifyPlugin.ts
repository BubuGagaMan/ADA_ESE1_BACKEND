import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import fastifyRedis from '@fastify/redis'

async function redisFastifyPlugin(app: FastifyInstance) {
    try {
        await app.register(fastifyRedis, {
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: Number(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD || '12345',
            connectTimeout: 5000,
            closeClient: true,
        })
        app.log.info('Redis connection established')
    } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : 'Unknown error when iniitating redis'
        app.log.error(`Redis Setup Error: ${errMessage}`)
        throw new Error(errMessage)
    }
}

export default fp(redisFastifyPlugin, { name: 'redis-cache' })
