import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'

// import AppDataSource from "./db/data-source.js";

import { testErrorCode } from './errors.js'

import { FastifyRequest, FastifyReply } from 'fastify'

import dotenv from 'dotenv'

import authenticate from './middleware/authenticate.js'
import authorise from '@middleware/authorise.js'

import dbFastifyPlugin from '@plugins/db.fastifyPlugin.js'
import redisFastifyPlugin from '@plugins/redis.fastifyPlugin.js'
import servicesFastifyPlugin from '@plugins/services.fastifyPlugin.js'

import cors from '@fastify/cors'
import fastifyCookie from '@fastify/cookie'
import emailFastifyPlugin from '@plugins/email.fastifyPlugin.js'
import routesFastifyPlugin from '@plugins/routes.fastifyPlugin.js'
import { customErrorHandler } from './lib/errorHandler.js'
import UserRole from './types/UserRole.js'

import fastifyRedis from '@fastify/rate-limit'

dotenv.config()

export async function buildApp(opts = {}) {
    const app = fastify(opts)
    app.setErrorHandler(customErrorHandler)
    await app.register(cors, {
        origin: process.env.FRONT_END_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'access-token'],
        credentials: true,
    })

    // await AppDataSource.initialize();
    // app.decorate("db", AppDataSource);

    // db/datasource plugin
    await app.register(dbFastifyPlugin)

    // redis plugin
    await app.register(redisFastifyPlugin)

    // rate-limit plugin - note rate-limiting occurs on redis, not on server
    await app.register(fastifyRedis, {
        max: 100,
        timeWindow: '30 seconds',
        redis: app.redis,
    })

    // jwt plugin
    await app.register(fastifyJwt, { secret: 'test' })

    // Register the plugin
    await app.register(fastifyCookie, {
        // secret: process.env.COOKIE_SECRET || 'my-secret-key',
        parseOptions: {},
    })

    // email sending
    await app.register(emailFastifyPlugin)

    // app services
    await app.register(servicesFastifyPlugin)

    app.get('/', async (_response, _reply) => {
        return { hello: 'world' }
    })
    app.get('/exampleError', async (_response, _reply) => {
        throw new testErrorCode()
    })

    app.decorate('authenticate', async (req: FastifyRequest, reply: FastifyReply) => await authenticate(req, reply))
    app.decorate(
        'authorise',
        async (req: FastifyRequest, reply: FastifyReply, necessaryRoles: UserRole[]) =>
            await authorise(req, reply, necessaryRoles),
    )
    //app.post("/testing-idk", async (req, reply) => { app.userService.registerUser(req.body)  })

    await app.register(routesFastifyPlugin)

    // manually call the notfound error handler (can direct system to jump to this route)
    app.get('/notfound', async (_request, reply) => {
        reply.callNotFound()
    })

    app.setNotFoundHandler(async (_request, reply) => {
        reply.code(404)
        return { error: 'Route not found' }
    })

    return app
}
