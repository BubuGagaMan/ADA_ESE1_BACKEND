import { User } from '@db/entities/user/User.entity.js'
import { EntityManager } from 'typeorm'

type UserDetailsKey = 'username' | 'email'

export const checkSingleExistingUserDetails = async (
    manager: EntityManager,
    userDetailKey: UserDetailsKey,
    userDetailValue: string,
) => {
    const obj: { username?: string; email?: string } = {}
    obj[userDetailKey] = userDetailValue

    const existingUser = await manager.findOneBy(User, obj)
    if (existingUser) {
        if (userDetailValue && existingUser[userDetailKey] === userDetailValue) {
            throw new Error(`${userDetailKey} already taken by another user`)
        }
    }

    return 0
}

export const checkMultipleExistingUserDetails = async (manager: EntityManager, username: string, email: string) => {
    const existingUser = await manager.findOneBy(User, [{ username }, { email }])

    if (existingUser) {
        // Use strict check (&& email) to ensure we don't match
        // a null DB field against an undefined variable
        if (email && existingUser.email === email) {
            throw new Error('Email already registered', { cause: { status: 409 } })
        }
        if (username && existingUser.username === username) {
            throw new Error('Username already taken', { cause: { status: 409 } })
        }
    }

    return 0
}
