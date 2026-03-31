import { EmailConfirmationEnum } from '@services/auth/emailConfirmation/emailConfirmationTypes.js'

export interface UserLoginBody {
    username: string
    password: string
}

export interface EmailConfirmationBody {
    username?: string
    email?: string
    password?: string
    confirmationType: EmailConfirmationEnum
}

export interface RegistrationConfirmationBody {
    username: string
    email: string
    password: string
}

export interface RefreshTokenRequest {
    Cookie: {
        refreshToken: string
    }
}
