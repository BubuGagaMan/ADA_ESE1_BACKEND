import { Diet } from '@db/entities/diet/Diet.entity.js'
import { IBaseServiceReturn } from './base.service.return.types.js'

export interface IUserServiceReturn extends IBaseServiceReturn {
    data: Diet | null
}
