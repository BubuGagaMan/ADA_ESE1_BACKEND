import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Role } from './entities/role/Role.entity.js'
import { User } from './entities/user/User.entity.js'
import { UserMetrics } from './entities/user_metrics/UserMetrics.entity.js'
import { Diet } from './entities/diet/Diet.entity.js'
import { Permission } from './entities/permission/Permission.entity.js'
import { Meal } from './entities/meal/Meal.entity.js'
import { Food } from './entities/food/Food.entity.js'
import { MealFood } from './entities/mealFoodJunction/MealFood.entity.js'

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'user1',
    password: process.env.DB_PASSWORD || '12345',
    database: process.env.DB_NAME || 'db1',
    synchronize: false, // use migrations instead!
    logging: true,
    entities: [
        // "./dist/db//entities/**/*.entity.js"
        Role,
        Permission,
        User,
        UserMetrics,
        Diet,
        Meal,
        Food,
        MealFood,
    ],

    migrations: ['./dist/db//migrations/**/*.js'],
})

export default AppDataSource
