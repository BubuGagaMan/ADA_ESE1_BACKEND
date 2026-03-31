import { EmailConfirmationEnum } from '@services/auth/emailConfirmation/emailConfirmationTypes.js'

export const updateUserSchema = {
    body: {
        type: 'object',
        required: ['confirmationType', 'confirmationCode'],
        properties: {
            confirmationType: {
                type: 'string',
                enum: Object.values(EmailConfirmationEnum), // 6 letters (capital)/numbers
            },
            confirmationCode: {
                type: 'string',
                minLength: 6,
                maxLength: 12,
                pattern: '^[A-Z0-9]+$', // 6 letters (capital)/numbers
            },
        },
    },
}

export const editProfileImageSchema = {
    body: {
        type: 'object',
        required: ['profile_image_url'],
        properties: {
            profile_image_url: {
                type: 'string',
                // format: 'uri',
            },
        },
    },
}
