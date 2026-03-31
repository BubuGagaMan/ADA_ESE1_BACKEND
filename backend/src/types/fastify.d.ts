import 'fastify'
import { DataSource } from 'typeorm'
import { JWT } from '@fastify/jwt'

import UserRole from './roles'
import { FastifyRedis } from '@fastify/redis'
import { UserServices } from '@services/user/user.services.ts'
import { UserMetricsService } from '@services/userMetrics/userMetrics.services.ts'
import { DietServices } from '@services/diet/diet.services.ts'
import { MealServices } from '@services/meal/meal.services.ts'
import { FoodServices } from '@services/food/food.services.ts'
import { MealFoodServices } from '@services/mealFood/mealFood.services.ts'
import { ResendEmailParams } from '@plugins/email.fastifyPlugin.ts'
import { AuthServices } from '@services/auth/auth.services.ts'
import { AdminServices } from '@services/admin/admin.services.ts'

declare module 'fastify' {
    interface FastifyInstance {
        db: DataSource
        redis: FastifyRedis

        authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void | FastifyReply>
        authorise: (
            req: FastifyRequest,
            reply: FastifyReply,
            necessaryRoles: UserRole[],
        ) => Promise<void | FastifyReply>

        userServices: UserServices
        authServices: AuthServices
        userMetricsServices: UserMetricsServices
        dietServices: DietServices
        mealServices: MealServices
        foodServices: FoodServices
        mealFoodServices: MealFoodServices
        adminServices: AdminServices
        sendEmail(options: ResendEmailParams): Promise<any>
    }
    interface FastifyRequest {
        jwt: JWT
    }
    interface FastifyContextConfig {
        /**
         * used by the custom error handler to map validation
         * messages to a specific resource (e.g., 'user' or 'food')
         */
        resource?: string
    }
}

interface UserPayload {
    id: string
    // email: string
    username: string
    roles?: UserRole[]
    suspended: boolean
}

interface userRolePayload {
    roles: userRole[]
}

declare module '@fastify/jwt' {
    interface FastifyJWT {
        user: UserPayload
    }
}
