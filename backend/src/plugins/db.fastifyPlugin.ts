import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import AppDataSource from '../db/data-source.js'

async function typeormPlugin(app: FastifyInstance) {
    if (!app.db) {
        // typeORM specific:  check if the connection is already open - initialise only if not

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize()
            app.log.info('Database connection initialized')
        }

        app.decorate('db', AppDataSource)

        //  listen for when the server is told to stop (SIGTERM/SIGINT).
        app.addHook('onClose', async (instance) => {
            // only destroy the connection if it's the same one we created.
            if (instance.db === AppDataSource) {
                // prevent 'zombie' connections from hanging around in Postgres.
                await AppDataSource.destroy()
                instance.log.info('Database connection destroyed')
            }
        })
    }
}

export default fp(typeormPlugin, {
    name: 'typeorm-db',
    fastify: '5.x',
})
