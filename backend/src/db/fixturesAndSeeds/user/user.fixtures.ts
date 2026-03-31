import { SEX, ACTIVITY_LEVEL } from '@db/entities/user_metrics/UserMetrics.entity.js'

export type UserData = {
    id: string
    username: string
    email: string
    password: string
    roleNames: string[]
    metrics: {
        height: number // * 10
        weight: number // * 10
        sex: SEX
        dob: string
        activity_level: ACTIVITY_LEVEL
    }
    suspended: false
}

const BASE_ROLE = process.env.BASE_ROLE || 'BASE_ROLE'

export const usersArr: UserData[] = [
    {
        id: '66666666-6666-4666-a666-666666666666',
        username: 'fitness_guru',
        email: 'bojik123@yahoo.com',
        password: '$2b$11$TnBOz.P9jiMo8YIUHri/re0kCpJ9FdXEpfU1E17eqgqy3kk7S0kEy', // hash for Pp123456789!
        roleNames: ['ADMIN'],
        metrics: {
            height: 1750,
            weight: 750,
            sex: 0,
            dob: '2000-12-26',
            activity_level: ACTIVITY_LEVEL.MODERATELY_ACTIVE,
        },
        suspended: false,
    },
    {
        id: '77777777-7777-4777-a777-777777777777',
        username: 'user_base1',
        email: 'bojidar.tenev@ada.ac.uk',
        password: '$2b$11$TnBOz.P9jiMo8YIUHri/re0kCpJ9FdXEpfU1E17eqgqy3kk7S0kEy', // hash for Pp123456789!
        roleNames: [BASE_ROLE],
        metrics: {
            height: 1750,
            weight: 750,
            sex: 0,
            dob: '2000-12-26',
            activity_level: ACTIVITY_LEVEL.MODERATELY_ACTIVE,
        },
        suspended: false,
    },
]
