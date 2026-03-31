import { FastifyInstance } from 'fastify'
import {
    loginUser,
    logoutUser,
    refreshUserToken,
    registerUser,
    resetPasswordEmailRequest,
    sendCodeConfirmation,
    sendRegistrationConfirmation,
} from '@controllers/auth/auth.controller.js'
import { EmailConfirmationBody } from '@controllers/auth/types.js'
import { emailConfirmationSchema, passwordResetEmailSchema, registrationSchema } from './auth.schemas.js'

export default async function authR(app: FastifyInstance) {
    app.post('/login', loginUser)
    app.post(
        '/logout',
        {
            // schema: emailConfirmationSchema,
            onRequest: [app.authenticate],
        },
        logoutUser,
    )
    app.post('/register', registerUser)
    app.post<{ Body: EmailConfirmationBody }>(
        '/confirmation-code-request',
        {
            schema: emailConfirmationSchema,
            onRequest: [app.authenticate],
        },
        sendCodeConfirmation,
    )
    app.post(
        '/register-confirmation',
        {
            schema: registrationSchema,
        },
        sendRegistrationConfirmation,
    )
    app.post(
        '/password-reset-code',
        {
            schema: passwordResetEmailSchema,
        },
        resetPasswordEmailRequest,
    )
    app.post(
        '/refresh-token',
        //  { onRequest: [app.authenticate] },
        refreshUserToken,
    )
}
