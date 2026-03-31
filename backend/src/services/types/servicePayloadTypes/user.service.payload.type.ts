import { EmailConfirmationEnum } from '@services/auth/emailConfirmation/emailConfirmationTypes.js'
import { IUserIdPayload } from './userId.payload.js'

export interface UpdateUserPayload extends IUserIdPayload {
    confirmationType: EmailConfirmationEnum
    confirmationCode: string
}
