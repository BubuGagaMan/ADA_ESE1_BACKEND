import { FastifyReply } from 'fastify'

interface GenericServiceResponse<Data> {
    data: Data | null
    message: string
    status: number
}

/**
 *
 * @param payload The data required for the service - needs to be processed in the controller
 * @param service The service function - binding could be required here, ESPECIALLY WITH NON ARROW FUNCTIONS!
 * @param reply The Fastify Reply
 * @param error Generic error message in case of a failure - e.g. Error has occurred while attempting to fetch x; the specific error message is proccessed in the function
 * @returns the reply with the status and data sent back (or just the error and message in the instance of an error)
 */
export async function generateGenericReply<ServicePayload, ServiceData>(
    payload: ServicePayload,
    service: (payload: ServicePayload) => Promise<GenericServiceResponse<ServiceData>>,
    reply: FastifyReply,
    error: string,
) {
    try {
        const { data, message, status } = await service(payload)

        if (!data) {
            return reply.status(status).send({ error, message })
        }

        return reply.status(status).send({ message, data })
    } catch (err) {
        return reply.status(500).send({
            error,
            message: err instanceof Error ? err.message : 'Unkown error',
        })
    }
}

interface DeleteServiceResponse<Data> {
    data?: Data | null
    message?: string
    status: number
}

/**
 *
 * @param payload The data required for the service - needs to be processed in the controller
 * @param service The service function - binding could be required here, ESPECIALLY WITH NON ARROW FUNCTIONS!
 * @param reply The Fastify Reply
 * @param error Generic error message in case of a failure - e.g. Error has occurred while attempting to delete x; the specific error message is proccessed in the function
 * @returns the reply with the status and data sent back (or just the error and message in the instance of an error)
 */
export async function generateDeleteReply<ServicePayload, ServiceData>(
    payload: ServicePayload,
    service: (payload: ServicePayload) => Promise<DeleteServiceResponse<ServiceData>>,
    reply: FastifyReply,
    error: string,
) {
    try {
        const { message, status } = await service(payload)

        if (status !== 204) {
            return reply.status(status).send({ message })
        }

        return reply.status(status).send()
    } catch (err) {
        return reply.status(500).send({
            error,
            message: err instanceof Error ? err.message : 'Unkown error',
        })
    }
}
