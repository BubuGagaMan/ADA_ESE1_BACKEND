import { EmailConfirmationEnum } from '@services/auth/emailConfirmation/emailConfirmationTypes.js'
import { FastifyRequest } from 'fastify'
import { IUserIdPayload } from './userId.payload.js'

export interface SendConfirmationEmailPayload {
    email?: string
    username?: string
    password?: string
    confirmationType: EmailConfirmationEnum
    req: FastifyRequest
}

export interface RegistrationConfirmationEmailPayload {
    username: string
    email: string
    password: string
    req: FastifyRequest
}

export interface UserDetailsChangeConfirmationPayload extends IUserIdPayload {
    req: FastifyRequest
    email?: string
    username?: string
    password?: string
    userId: string
}
