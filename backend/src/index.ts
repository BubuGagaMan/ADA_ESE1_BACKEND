import closeWithGrace from 'close-with-grace'
import { buildApp } from './app.js'
import dotenv from 'dotenv'

dotenv.config()

interface opts {
    logger?:
        | {
              transport: {
                  target: string
              }
          }
        | boolean
    ajv?: any
}

const opts: opts = {
    ajv: {
        // customOptions: {
        //     // removeAdditional: 'all'
        // },
    },
}

if (process.stdout.isTTY) {
    opts.logger = {
        transport: {
            target: 'pino-pretty',
        },
    }
} else {
    opts.logger = true
}

buildApp(opts)
    .then((app) => {
        return app.ready().then(() => app)
    })
    .then((app) => {
        const port: number = Number(process.env.PORT) || 3000
        const host = process.env.HOST || '0.0.0.0'

        closeWithGrace(async ({ signal, err }) => {
            if (err) {
                app.log.error({ err }, 'server closing with error')
            } else {
                app.log.info(`${signal} received, server closing`)
            }

            // prevent "NotConnected error on shutdown"
            if (app.db && app.db.isInitialized) {
                await app.db.destroy()
            }
            await app.close()
        })

        app.listen({ port, host }, (err, _address: string) => {
            if (err) {
                app.log.error(err)
                process.exit(1)
            }
        })
    })
    .catch((err) => {
        console.error('Fatal error during boot:', err)
        process.exit(1)
    })
