import { FastifyReply, FastifyRequest } from 'fastify'
import { SwapUserSuspendStatusRequest } from './types.js'
import { generateGenericReply } from '@controllers/utils/generateControllerReply.js'

// have 1 controller to swithc status on and off instead of 2...
export const swapUserSuspendedStatus = async (
    req: FastifyRequest<SwapUserSuspendStatusRequest>,
    reply: FastifyReply,
) => {
    const error = 'An error has occurred while attempting to ban a user'
    const payload = {
        targetUserId: req.params.userId,
        requestingUserId: req.user.id,
        message: req.body.message,
        req,
    }

    return await generateGenericReply(payload, req.server.adminServices.swapUserSuspendedStatus, reply, error)
}
