export const swapUserSuspendStatusSchema = {
    params: {
        type: 'object',
        required: ['userId'],
        properties: {
            userId: { type: 'string', format: 'uuid' },
        },
    },
    body: {
        type: 'object',
        required: ['message'],
        properties: {
            message: {
                type: 'string',
                minLength: 5,
                maxLength: 255,
                // Prevents just sending "     "
                pattern: '^\\S+(?: \\S+)*$',
            },
        },
    },
}

export const getAllUsersSchema = {
    querystring: {
        type: 'object',
        required: ['page', 'limit'],
        properties: {
            page: {
                type: 'integer',
                minimum: 1,
                default: 1,
            },
            limit: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
                default: 10,
            },
            search: {
                type: 'string',
                maxLength: 50,
                pattern: '^[a-zA-Z0-9 ]*$', // Allow alphanumeric and spaces only
            },
        },
    },
}
