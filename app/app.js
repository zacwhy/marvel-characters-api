import Koa from 'koa'
import logger from 'koa-logger'
import Router from 'koa-router'

export default function (characterService) {
  const app = new Koa()
  const router = new Router()

  router.get('/characters', async (ctx) => {
    const charactersMap = await characterService.all()
    ctx.body = Object.keys(charactersMap)
  })

  router.get('/characters/:id', async (ctx) => {
    const id = ctx.params.id
    const character = await characterService.find(id)
    ctx.body = {
      Id: id,
      Name: character.name,
      Description: character.description,
    }
  })

  app
    .use(logger())
    .use(router.routes())
    .use(router.allowedMethods())

  return app
}
