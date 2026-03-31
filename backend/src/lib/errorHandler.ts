import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { validationMessages } from './validationMessages.js'

export const customErrorHandler = async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    if (error.validation && error.validation.length > 0) {
        const err = error.validation[0]
        let path = err.instancePath

        if (err.keyword === 'required') {
            path = `${path}/${err.params.missingProperty}`
        }

        // replace 'body' AND 'cookies' prefixes
        const normalizedPath = path
            .replace(/^body/, '')
            .replace(/^cookies/, '')
            .replace(/^\/*/, '/')

        // get context from route config
        const resource = (request.routeOptions.config as any).resource

        // e.g. try to find: "/user/weight", then fall back to "/weight"
        const contextPath = resource ? `/${resource}${normalizedPath}` : normalizedPath

        const keyword = err.keyword
        const customMessage =
            validationMessages[contextPath]?.[keyword] || validationMessages[normalizedPath]?.[keyword]

        return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: customMessage || `Validation failed: ${err.message}`,
        })
    }

    return reply.status(error.statusCode || 500).send({ error: error.message })
}
