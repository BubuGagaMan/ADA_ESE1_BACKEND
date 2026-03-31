import AppDataSource from '@db/data-source.js'
import { UserMetrics } from './UserMetrics.entity.js'

export default AppDataSource.getRepository(UserMetrics)
