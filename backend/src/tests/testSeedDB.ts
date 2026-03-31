// seed db file while accepts the app as a parameter - for lighter load during tests instead of a production seeding
import { seedFoods } from '@db/fixturesAndSeeds/food/food.db.seed.js'
import { seedUsers } from '@db/fixturesAndSeeds/user/user.db.seed.js'
import { seedDiets } from '@db/fixturesAndSeeds/diet/diet.db.seed.js'
import { seedPermissions } from '@db/fixturesAndSeeds/permission/permission.db.seed.js'
import { seedRoles } from '@db/fixturesAndSeeds/role/role.seed.db.js'
import { seedMeals } from '@db/fixturesAndSeeds/meal/meal.db.seed.js'
import { FastifyInstance } from 'fastify'

async function testSeedDB(app: FastifyInstance) {
    console.info('Clearing Database:')

    const queryRunner = app.db.createQueryRunner()

    await queryRunner.connect()

    await queryRunner.query(
        `TRUNCATE TABLE 
        "user", 
        "role",
        "permission",
        "role_permissions",
        "user_roles",
        "user_metrics", 
        "diet", 
        "food", 
        "meal",  
        "meal_food"
        RESTART IDENTITY CASCADE`,
    )

    console.info('DB cleared!')

    console.info('Initiating entry additions...')

    console.info('Adding food entries:')
    await seedFoods(queryRunner)

    console.info('Adding permission entries')
    await seedPermissions(queryRunner)

    console.info('Adding role entries')
    await seedRoles(queryRunner)

    console.info('Adding users with roles and user metrics')
    await seedUsers(queryRunner)

    console.info('Adding user diets')
    await seedDiets(queryRunner)

    console.info('Adding diet meals with foods')
    await seedMeals(queryRunner)

    await queryRunner.release()
    // await app.close()
}

// await seedDB()
//     .then(() => {
//         console.log('Database seed complete!')
//     })
//     .catch((err: unknown) => {
//         console.error(err instanceof Error ? err.message : 'Unknown error while attempting to seed db')
//     })

export default testSeedDB
