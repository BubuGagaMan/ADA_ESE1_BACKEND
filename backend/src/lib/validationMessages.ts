export type ValidationMap = {
    [path: string]: {
        [keyword: string]: string
    }
}

export const validationMessages: ValidationMap = {
    '/suspension/message': {
        required: 'A reason for the suspension status change is required',
        minLength: 'The suspension message must be at least 5 characters long',
        maxLength: 'The message is too long (max 255 characters)',
        pattern: 'The message cannot be empty or consist only of spaces',
    },

    // Specific to the userId (if you want it context-specific too)
    '/suspension/userId': {
        format: 'The User ID provided to the suspension route is invalid',
        required: 'User ID is required to toggle suspension',
    },
    '/username': {
        pattern: 'Username must not contain spaces',
        maxLength: 'Username is too long (max 16 chars)',
        required: 'Username is a required field',
    },
    '/email': {
        format: 'Please provide a valid email address',
        required: 'Email is a required field',
    },
    '/password': {
        pattern: 'Password must include uppercase, lowercase, a number, and a special character',
        minLength: 'Password must be at least 8 characters long',
        required: 'Password is a required field',
    },
    '/confirmationType': {
        enum: 'Confirmation Type must be password reset, email change, username change or forgotten password',
        required: 'Confirmation Type is required',
    },
    '/confirmaitonCode': {
        pattern: 'Confirmation code must be 6 uppercase alphanumeric characters',
        retuired: 'Confirmation code is required',
    },
    '/dietId': {
        format: 'The Diet ID provided is not a valid UUID',
        required: 'Diet ID is missing from the URL parameters',
        type: 'Diet ID must be a string',
    },
    '/weightGoal': {
        enum: 'Weight goal must be one of: LOSE, MAINTAIN, or GAIN',
        required: 'Please select a weight goal',
    },
    '/name': {
        minLength: 'Name must be at least 3 characters',
        maxLength: 'Name is too long (max 24 chars)',
        pattern: 'Name cannot be empty or start/end with spaces',
        required: 'Name is required',
    },
    '/userMetrics': {
        required: 'User metrics data is required',
        type: 'User metrics must be an object',
    },
    '/userMetrics/height': {
        type: 'Height must be a number',
        minimum: 'Height must be at least 50cm',
        required: 'Height is required',
    },
    '/userMetrics/weight': {
        type: 'Weight must be a number',
        minimum: 'Weight must be at least 20kg',
        required: 'Weight is required',
    },
    '/userMetrics/sex': {
        enum: 'Please select a valid sex option',
        required: 'Sex is required',
    },
    '/userMetrics/dob': {
        format: 'Date of birth must be a valid date (YYYY-MM-DD)',
        required: 'Date of birth is required',
    },
    '/userMetrics/activity_level': {
        enum: 'Please select a valid activity level',
        required: 'Activity level is required',
    },
    '/mealId': {
        format: 'The Meal ID provided is not a valid UUID',
        required: 'Meal ID is missing from the URL parameters',
        type: 'Meal ID must be a string',
    },
    '/foodId': {
        format: 'The Food ID provided is not a valid UUID',
        required: 'Food ID is missing from the URL parameters',
    },
    '/food/weight': {
        type: 'Food weight must be a number',
        minimum: 'Food weight must be at least 1 gram',
        required: 'Food weight is required',
    },

    '/height': {
        type: 'Height must be a number',
        minimum: 'Height must be at least 50cm',
        required: 'Height is required',
    },
    '/user/weight': {
        type: 'Body weight must be a number',
        minimum: 'Body weight must be at least 20kg',
        required: 'Body weight is required',
    },
    '/sex': {
        enum: 'Please select a valid sex option',
        required: 'Sex is required',
    },
    '/dob': {
        format: 'Date of birth must be a valid date (YYYY-MM-DD)',
        required: 'Date of birth is required',
    },
    '/activity_level': {
        enum: 'Please select a valid activity level',
        required: 'Activity level is required',
    },

    '/weight': {
        required: 'Weight is required',
    },

    '/profile_image_url': {
        format: 'Please provide a valid URL (e.g., https://example.com/image.jpg)',
        pattern: 'The profile image must be a JPG, PNG, WEBP, or AVIF file',
        required: 'A profile image URL is required',
    },

    '/page': {
        type: 'Page must be a number',
        minimum: 'Page must be at least 1',
        required: 'Page number is required',
    },
    '/limit': {
        type: 'Limit must be a number',
        minimum: 'Limit must be at least 1',
        maximum: 'Limit cannot exceed 100 per page',
        required: 'Limit is required',
    },
    '/search': {
        maxLength: 'Search term is too long',
        pattern: 'Search contains invalid characters',
    },

    '/refreshToken': {
        required: 'Session expired or invalid. Please log in again.',
        pattern: 'The session token format is invalid.',
        minLength: 'The session token is malformed.',
    },
}
