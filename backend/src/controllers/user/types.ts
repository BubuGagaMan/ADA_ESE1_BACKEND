import { EmailConfirmationEnum } from '@services/auth/emailConfirmation/emailConfirmationTypes.js'
import { FastifyRequest } from 'fastify'

export interface GetAllUsersRequest {
    Querystring: { page: number; limit: string; search: string }
}

export interface UpdateUserBody {
    confirmationType: EmailConfirmationEnum
    confirmationCode: string
}

export type RequestWithUserIdParams = FastifyRequest<{
    Params: { userId: string }
    user?: { id: string; username: string }
}>

export interface EditProfileImageBody {
    profile_image_url: string
}
