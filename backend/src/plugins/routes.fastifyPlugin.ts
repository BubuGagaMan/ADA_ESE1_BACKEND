import authR from '@routes/auth/auth.routes.js'
import dietR from '@routes/diet/diet.routes.js'
import mealR from '@routes/meal/meal.routes.js'
import foodR from '@routes/food/food.routes.js'
import { FastifyInstance } from 'fastify'
import userMetricsR from '@routes/userMetrics/UserMetrics.routes.js'
import userR from '@routes/user/User.routes.js'

import fp from 'fastify-plugin'
import adminR from '@routes/admin/admin.routes.js'

const routesFastifyPlugin = async (app: FastifyInstance) => {
    try {
        // await app.register(exampleRoute) // turn on to see basic setup
        await app.register(userR)
        await app.register(authR)
        await app.register(userMetricsR)
        await app.register(dietR)
        await app.register(mealR)
        await app.register(foodR)
        await app.register(adminR)
    } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : 'Unknown error when iniitating routes'
        app.log.error(`Erorr when initiating routes: ${errMessage}`)
        throw new Error(errMessage)
    }
}

export default fp(routesFastifyPlugin, { name: 'routes' })
