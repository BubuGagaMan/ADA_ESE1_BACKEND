import { EntityManager } from 'typeorm'
import { Diet } from '@db/entities/diet/Diet.entity.js'
import { User } from '@db/entities/user/User.entity.js'
import { DietData } from './diet.fixtures.js'

const addDiet = async (dietData: DietData, manager: EntityManager) => {
    const user = await manager.findOneBy(User, { id: dietData.userId })

    if (!user) {
        throw new Error(`User with ID ${dietData.userId} not found while adding diet.`)
    }

    const diet = manager.create(Diet, {
        ...dietData,
        user: user,
    })

    await manager.save(diet)
}

export default addDiet
