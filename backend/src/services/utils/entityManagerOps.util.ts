import { capitalise } from '@utilities/capitalise.util.js'
import { EntityManager, EntityTarget, FindOptionsWhere, ObjectLiteral } from 'typeorm'

export async function findOneEntityBy<T extends ObjectLiteral>(
    manager: EntityManager,
    entity: EntityTarget<T>,
    options: FindOptionsWhere<T>,
    entityName: string,
) {
    const record = await manager.findOneBy(entity, options)

    if (!record) throw new Error(`${capitalise(entityName)} not found`, { cause: { status: 404 } })

    return record
}
