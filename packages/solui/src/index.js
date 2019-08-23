import Koa from 'koa'
import cors from '@koa/cors'
import Router from 'koa-router'
import next from 'next'

import { validate } from './spec'
import { APP_STATE_KEYS } from './frontend'

export class Generator {
  constructor ({ port, artifacts, ui }) {
    this.port = parseInt(port || '3001', 10)
    this.artifacts = artifacts
    this.ui = ui
  }

  async start () {
    const app = next({ dev: true })

    await app.prepare()

    const appHandler = app.getRequestHandler()

    const router = new Router()

    router.get('*', async ctx => {
      await appHandler(ctx.req, ctx.res)
      ctx.respond = false
    })

    this.server = new Koa()

    this.server.use(cors({ origin: '*', credentials: true }))

    // feed data into frontend
    this.server.use(async (ctx, nextHandler) => {
      APP_STATE_KEYS.forEach(k => {
        ctx.res[k] = this[k]
      })
      await nextHandler()
    })

    this.server.use(router.routes())

    await new Promise((resolve, reject) => {
      this.server.listen(this.port, '0.0.0.0', err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  getEndpoint () {
    return `http://0.0.0.0:${this.port}`
  }
}

export const startGenerator = async cfg => {
  await validate(cfg)

  const g = new Generator(cfg)
  await g.start()

  return g
}