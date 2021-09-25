import Koa from 'koa'
import logger from 'koa-logger'
import Router from 'koa-router'
import swagger from 'swagger2'
import swaggerKoa from 'swagger2-koa'

export default function (characterService) {
  const swaggerDocument = swagger.loadDocumentSync('api.yaml')

  const app = new Koa()
  const router = new Router()

  router.get('/characters', async (ctx) => {
    const charactersMap = await characterService.all()
    ctx.body = Object.keys(charactersMap).map(id => parseInt(id))
  })

  router.get('/characters/:id', async (ctx) => {
    const id = ctx.params.id
    const character = await characterService.find(id)

    if (!character) {
      return ctx.status = 404
    }

    ctx.body = {
      Id: parseInt(id),
      Name: character.name,
      Description: character.description,
    }
  })

  router.redirect('/', '/swagger')

  app
    .use(logger())
    .use(swaggerKoa.ui(swaggerDocument, '/swagger'))
    .use(router.routes())
    .use(router.allowedMethods())

  return app
}
