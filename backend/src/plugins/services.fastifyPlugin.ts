import fp from 'fastify-plugin'
import { UserServices } from '@services/user/user.services.js'
import { UserMetricsServices } from '@services/userMetrics/userMetrics.services.js'
import { DietServices } from '@services/diet/diet.services.js'
import { MealServices } from '@services/meal/meal.services.js'
import { FoodServices } from '@services/food/food.services.js'
import { MealFoodServices } from '@services/mealFood/mealFood.services.js'
import { AuthServices } from '@services/auth/auth.services.js'
import { AdminServices } from '@services/admin/admin.services.js'

export default fp(
    async (app) => {
        const userServices = new UserServices(app.db, app.redis)
        const authServices = new AuthServices(app.db, app.redis)
        const userMetricsServices = new UserMetricsServices(app.db)
        const dietServices = new DietServices(app.db)
        const mealServices = new MealServices(app.db)
        const foodServices = new FoodServices(app.db)
        const mealFoodServices = new MealFoodServices(app.db)
        const adminServices = new AdminServices(app.db, app.redis)

        app.decorate('userServices', userServices)
        app.decorate('authServices', authServices)
        app.decorate('userMetricsServices', userMetricsServices)
        app.decorate('dietServices', dietServices)
        app.decorate('mealServices', mealServices)
        app.decorate('foodServices', foodServices)
        app.decorate('mealFoodServices', mealFoodServices)
        app.decorate('adminServices', adminServices)

        app.log.info('Services injected successfully')
    },
    {
        dependencies: ['typeorm-db', 'redis-cache'],
    },
)
