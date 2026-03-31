import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export default async function exampleRoute(app: FastifyInstance) {
    app.get('/exampleRoute', async (_request: FastifyRequest, _reply: FastifyReply) => {
        return { data: 'some data' }
    })

    const postSchema = {
        schema: {
            body: {
                type: 'object',
                properties: {
                    label: { type: 'string' },
                    value: { type: 'number' },
                },
                required: ['label', 'value'],
            },
        },
    }

    app.post(
        '/exampleRoute',
        postSchema,
        async (request: FastifyRequest<{ Body: { label: string; value: string } }>, _reply: FastifyReply) => {
            const { label, value } = request.body

            // ...db query...

            return { label, value }
        },
    )
}
