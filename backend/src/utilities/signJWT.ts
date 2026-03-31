import { Role } from '@db/entities/role/Role.entity.js'
import { FastifyInstance } from 'fastify'
// import { User } from "../db/entities/users/User.entity.js"

//
export interface TokenUserPayload {
    id: string
    username: string
    suspended: boolean
    roles: Role[]
}

type TimeUnit = 'ms' | 's' | 'd' | 'h'

/**
 * A string representing a duration.
 * It must be a number followed by a valid time unit.
 *
 * @example
 * '100ms'
 * '2.5s'
 * '7d'
 * '24h'
 */
type TimeString = `${number}${TimeUnit}`

const signJWT = (app: FastifyInstance, userPayload: TokenUserPayload, expiresIn: TimeString) => {
    const token = app.jwt.sign(userPayload, {
        expiresIn,
    })

    return token
}

export default signJWT
