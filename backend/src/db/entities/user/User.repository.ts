import AppDataSource from '../../data-source.js'
import { User } from './User.entity.js'

export default AppDataSource.getRepository(User)
