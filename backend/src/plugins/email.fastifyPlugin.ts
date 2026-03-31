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
    const isTestEnv = process.env.NODE_ENV === 'test'
    const resend = isTestEnv ? null : new Resend(process.env.RESEND_API_KEY || 'noKey')

    fastify.decorate('sendEmail', async ({ from, to, subject, html }: ResendEmailParams) => {
        if (resend) {
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
        }

        if (isTestEnv) {
            fastify.log.info(`[MOCK EMAIL] Simulated sending email to: ${to} | Subject: ${subject}`)
            return { id: 'mock-email-id' } // Return a dummy success object
        }
    })
}

export default fp(emailPlugin)
