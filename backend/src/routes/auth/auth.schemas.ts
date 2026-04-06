import { EmailConfirmationEnum } from '@services/auth/emailConfirmation/emailConfirmationTypes.js'

export const registrationSchema = {
    body: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
            username: {
                type: 'string',
                maxLength: 16,
                pattern: '^\\S+$', // ensures no whitespace characters
            },
            email: {
                type: 'string',
                format: 'email',
            },
            password: {
                type: 'string',
                minLength: 8,
                // regex: 1 upper, 1 lower, 1 digit, 1 special char
                pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$',
            },
        },
    },
}

export const emailConfirmationSchema = {
    body: {
        type: 'object',
        required: ['confirmationType'],
        properties: {
            username: {
                type: 'string',
                maxLength: 16,
                pattern: '^\\S+$',
            },
            email: {
                type: 'string',
                format: 'email',
            },
            password: {
                type: 'string',
                minLength: 8,
                pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$',
            },
            confirmationType: {
                type: 'string',
                // regex: exactly 6 uppercase letters, no numbers/spaces/specials
                enum: Object.values(EmailConfirmationEnum),
            },
        },
    },
}

export const passwordResetEmailSchema = {
    body: {
        type: 'object',
        required: ['email'],
        properties: {
            email: {
                type: 'string',
                format: 'email',
            },
        },
    },
}

export const refreshTokenSchema = {
    cookies: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
            refreshToken: {
                type: 'string',
            },
        },
    },
}
