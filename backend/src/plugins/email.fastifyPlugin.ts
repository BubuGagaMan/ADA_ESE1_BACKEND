import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { Resend } from 'resend'

export type ResendEmailParams = {
    from: string
    to: string | string[]
    subject: string
    html: string
}

const emailPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    const resend = new Resend(process.env.RESEND_API_KEY || 'noKey')

    fastify.decorate('sendEmail', async ({ from, to, subject, html }: ResendEmailParams) => {
        try {
            const { data, error } = await resend.emails.send({
                from,
                to,
                subject,
                html,
            })

            if (error) {
                throw new Error(error.message)
            }
            return data
        } catch (err) {
            const errMessage = err instanceof Error ? err.message : 'Unkown error when attempting to send email'
            fastify.log.error(errMessage)
            throw new Error(errMessage)
        }
    })
}

export default fp(emailPlugin)
