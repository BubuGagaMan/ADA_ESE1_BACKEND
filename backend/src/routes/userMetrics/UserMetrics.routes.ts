import { CreateUserMetricsRequest } from '@controllers/userMetrics/types.js'
import UserMetricsController from '@controllers/userMetrics/UserMetrics.controller.js'
import { FastifyInstance } from 'fastify'
import { createUserMetricsSchema } from './UserMetrics.schemas.js'

export default async function userMetricsR(app: FastifyInstance) {
    const userMetricsController = new UserMetricsController()

    app.post<CreateUserMetricsRequest>(
        '/user-metrics',
        {
            schema: createUserMetricsSchema,
            config: { resource: 'user' }, // user context for validation error messages
            onRequest: [
                app.authenticate,
                // async (req: ReqWithUserIdParams, reply: FastifyReply) => {
                //     await authorise(req, reply, ["admin"], true);
                // },
            ],
        },
        userMetricsController.create,
    )
    app.get(
        '/user-metrics',
        {
            onRequest: [
                app.authenticate,
                // async (req: ReqWithUserIdParams, reply: FastifyReply) => {
                //     await authorise(req, reply, ["admin"], true);
                // },
            ],
        },
        userMetricsController.get,
    )
    app.put<CreateUserMetricsRequest>(
        '/user-metrics',
        {
            schema: createUserMetricsSchema,
            onRequest: [
                app.authenticate,
                // async (req: ReqWithUserIdParams, reply: FastifyReply) => {
                //     await authorise(req, reply, ["admin"], true);
                // },
            ],
        },
        userMetricsController.put,
    )
}
