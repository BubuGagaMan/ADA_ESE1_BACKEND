import { FastifyReply, FastifyRequest } from 'fastify'
import UserRole from '../types/UserRole.js'
import loadUserRolesFromCache from '@services/user/loadUserRolesFromCache.js'

// USE ONLY AFTER AUTHENTICATION!!!
const authorise = async (req: FastifyRequest, reply: FastifyReply, necessaryRoles: UserRole[]) => {
    const error = 'Failure on authorisation'
    try {
        if (!req.user.id) {
            return reply.status(401).send({ error, message: 'User not authenticated' })
        }
        const roles = await loadUserRolesFromCache(req.user.id, req.server.redis)

        const hasNecessaryRoles = roles ? necessaryRoles.every((role) => roles.includes(role)) : false

        if (!hasNecessaryRoles) {
            return reply.status(403).send({ error, message: 'Unauthorised' })
        }
    } catch (err) {
        return reply.status(500).send({
            error,
            message: err instanceof Error ? err.message : 'Unknown error ocurred while attempting to authorise',
        })
    }
}

export default authorise
