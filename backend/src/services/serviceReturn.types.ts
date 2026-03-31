import { User } from '@db/entities/user/User.entity.js'
export interface IBaseServiceReturn {
    message: string
    status: number
}

export interface IUserServiceReturn extends IBaseServiceReturn {
    data: User | null
}

export interface IUserMetricsServiceReturn extends IBaseServiceReturn {
    data: User | null
}
