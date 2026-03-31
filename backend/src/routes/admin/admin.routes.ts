import { FastifyInstance } from 'fastify'

import { swapUserSuspendedStatus } from '@controllers/admin/admin.controller.js'
import { swapUserSuspendStatusSchema } from './admin.schemas.js'
import { SwapUserSuspendStatusRequest } from '@controllers/admin/types.js'
import UserController from '@controllers/user/User.controller.js'
import { GetAllUsersRequest } from '@controllers/user/types.js'

export default async function adminR(app: FastifyInstance) {
    const userController = new UserController()

    app.get<GetAllUsersRequest>(
        '/get-all-users',
        {
            onRequest: [
                app.authenticate,
                async (req, reply) => {
                    await app.authorise(req, reply, ['ADMIN'])
                },
            ],
        },
        userController.getAll,
    )
    app.post<SwapUserSuspendStatusRequest>(
        '/swap-suspend-status/:userId',
        {
            onRequest: [
                app.authenticate,
                async (req, reply) => {
                    await app.authorise(req, reply, ['ADMIN'])
                },
            ],
            schema: swapUserSuspendStatusSchema,
            config: { resource: 'suspension' },
        },
        swapUserSuspendedStatus,
    )
}
