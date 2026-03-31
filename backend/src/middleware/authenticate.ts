import { TokenUserPayload } from '@utilities/signJWT.js'
import { FastifyReply, FastifyRequest } from 'fastify'

const authenticate = async (req: FastifyRequest, reply: FastifyReply) => {
    const error = 'Failure during authorisation'
    try {
        const decodedJWTPayload = (await req.server.jwt.verify(
            req.headers['access-token'] as string,
        )) as TokenUserPayload

        // redis lookups for instant suspension mid-jwt expiry
        const redisSuspendedValue = await req.server.redis.get(`user:suspended:${decodedJWTPayload.id}`)

        if (decodedJWTPayload.suspended || redisSuspendedValue) {
            return reply.status(403).send({
                error,
                message: 'Account suspended',
            })
        }

        req.user = {
            id: decodedJWTPayload.id,
            username: decodedJWTPayload.username,
            roles: decodedJWTPayload.roles,
            suspended: decodedJWTPayload.suspended,
        }
    } catch (err) {
        return reply.status(401).send({
            error,
            message: err instanceof Error ? err.message : 'Unknown error',
        })
    }
}

export default authenticate
