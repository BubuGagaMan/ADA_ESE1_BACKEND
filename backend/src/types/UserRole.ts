const UserRoles = {
    ADMIN_ROLE: 'ADMIN',
    DEFAULT_ROLE: process.env.DB__BASE_USER_ROLE || 'BASE_ROLE',
} as const

type UserRole = (typeof UserRoles)[keyof typeof UserRoles]

export default UserRole
