import { FastifyRequest, FastifyReply } from 'fastify'
import { RegistrationConfirmationEmailPayload } from '@services/types/servicePayloadTypes/auth.service.payload.type.js'
import { EmailConfirmationBody, RegistrationConfirmationBody, UserLoginBody } from './types.js'
import { CookieSerializeOptions } from '@fastify/cookie'

export const sendRegistrationConfirmation = async (
    req: FastifyRequest<{ Body: RegistrationConfirmationBody }>,
    reply: FastifyReply,
) => {
    const error = 'An error has occurred while attempting to send a confimration code'
    const payload: RegistrationConfirmationEmailPayload = {
        ...req.body,
        req,
    }
    let redisKey = ''
    try {
        const { status, message, redisKeyToDelete } =
            await req.server.authServices.sendRegistrationConfirmation(payload)
        redisKey = redisKeyToDelete
        if (status !== 200) {
            reply.status(status).send({ error, message })
            return
        }

        return reply.status(status).send({ message })
    } catch (err) {
        // delete key if service succeeds, but controller fails
        await req.server.redis.del(redisKey)
        return reply.status(500).send({
            error,
            message: err instanceof Error ? err.message : 'Uknown',
        })
    }
}

export const sendCodeConfirmation = async (
    req: FastifyRequest<{ Body: EmailConfirmationBody }>,
    reply: FastifyReply,
) => {
    const error = 'An error has occurred while attempting to send a confimration code'

    try {
        // default case
        const payload = {
            ...req.body,
            userId: req.user.id,
            req,
        }

        const { status, message } = await req.server.authServices.sendUserDetailsChangeConfirmation(payload)

        if (status !== 200) {
            reply.status(status).send({ error, message })
            return
        }

        return reply.status(status).send({ message })
    } catch (err) {
        return reply.status(500).send({
            error,
            message: err instanceof Error ? err.message : 'Uknown',
        })
    }
}

export const resetPasswordEmailRequest = async (
    req: FastifyRequest<{ Body: { email: string } }>,
    reply: FastifyReply,
) => {
    const error = 'An error ocurred while attempting to send reset password code'

    const payload = {
        ...req.body,
        req,
    }

    try {
        const { status, message } = await req.server.authServices.resetPasswordRequest(payload)

        if (status !== 200) {
            return reply.status(status).send({ error, message })
        }

        return reply.status(status).send(message)
    } catch (err) {
        return reply.status(500).send({ error, message: err instanceof Error ? err.message : 'Unkown error' })
    }
}

export const registerUser = async (
    req: FastifyRequest<{ Body: { confirmationCode: string } }>,
    reply: FastifyReply,
) => {
    const error = 'Error while attempting to register a new user'

    try {
        const { data, status, message } = await req.server.userServices.registerUser(req.body)

        if (!data) {
            reply.status(status).send({ error, message })
            return
        }

        return reply.status(status).send({ message, data })
    } catch (err) {
        return reply.status(500).send({
            error,
            message: err instanceof Error ? err.message : 'Uknown error',
        })
    }
}

export const loginUser = async (req: FastifyRequest<{ Body: UserLoginBody }>, reply: FastifyReply) => {
    const error = 'Error occurred while attempting user login.'
    let redisKeys: string[] = []

    const payload = {
        ...req.body,
        req,
    }

    try {
        const { data, message, status, redisKeysToDelete } = await req.server.authServices.login(payload)
        if (data && status === 200 && redisKeysToDelete) {
            redisKeys = redisKeysToDelete
            reply.setCookie('refresh_token', data.refreshToken, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // only HTTPS in prod
                // be and fe expected to be on different domains
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            })
            reply.status(status).send({ message, data: { accessToken: data.accessToken } })
            return
        }

        reply.status(status).send({ error, message })
        return
    } catch (err) {
        // clear keys if service suceeded but controller failed
        if (redisKeys) {
            for (const value of redisKeys) {
                await req.server.redis.del(value)
            }
        }
        return reply.status(500).send({
            error,
            message: err instanceof Error ? err.message : 'Uknown error',
        })
    }
}

export const logoutUser = async (req: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = req.cookies.refresh_token ?? ''
    const payload = {
        userId: req.user.id,
        refreshToken,
    }
    const error = 'An error occurred while attempting to log user out'

    const clearCookieOptions: CookieSerializeOptions = {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',

        // Wrap it in parentheses and cast it to the exact literal types Fastify expects!
        sameSite: 'lax' as 'lax',
    }

    if (!refreshToken) {
        reply.clearCookie('refresh_token', clearCookieOptions)
        return reply.status(200).send({ message: 'Successfully logged out' })
    }
    try {
        reply.clearCookie('refresh_token', clearCookieOptions)
        const { status, message } = await req.server.authServices.logout(payload)
        if (status === 200) {
            return reply.status(status).send({ message })
        }
        return reply.status(status).send({ error, message })
    } catch (err) {
        reply.clearCookie('refresh_token', clearCookieOptions)
        return reply.status(500).send({
            error,
            err: err instanceof Error ? err.message : 'Unkown error',
        })
    }
}

export const refreshUserToken = async (req: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = req.cookies.refresh_token ?? ''

    const payload = {
        refreshToken,
        req,
    }
    const error = 'Error while attempting to refresh token'
    try {
        const { data, message, status } = await req.server.authServices.refreshJWT(payload)

        if (data && status === 200) {
            reply.setCookie('refresh_token', data.refreshToken, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // only HTTPS in prod
                // be and fe expected to be on different domains
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            })

            reply.status(status).send({ message, data: { accessToken: data.accessToken, redepoyed: true } })
            return
        }

        reply.status(status).send({ error, message })
        return
    } catch (err) {
        return reply.status(500).send({
            error,
            message: err instanceof Error ? err.message : 'Uknown error',
        })
    }
}
