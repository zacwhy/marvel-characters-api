import request from 'supertest'

import makeApp from './app'

const mockCharacterService = (() => {
  return {
    async all() {
      return {
        '1011334': {},
        '1017100': {},
        '1009144': {},
      }
    },
    async find(id) {
      if (id === '1011127') {
        return {
          name: 'Zodiak',
          description: 'Twelve demons merged with Norman Harrison, who, soon after, adopted the guise of Zodiac and used his abilities to harness powers based on the astrological Zodiac.',
        }
      }
      return undefined
    },
  }
})()

test('GET / redirects to /swagger', async () => {
  const app = makeApp(mockCharacterService)
  const response = await request(app.callback()).get('/')
  expect(response.status).toBe(301)
  expect(response.text).toBe('Redirecting to <a href=\"/swagger\">/swagger</a>.')
})

test('get IDs of characters', async () => {
  const app = makeApp(mockCharacterService)
  const response = await request(app.callback()).get('/characters')
  expect(response.status).toBe(200)
  expect(response.body).toStrictEqual([1009144, 1011334, 1017100])
})

test('get information of one character', async () => {
  const app = makeApp(mockCharacterService)
  const response = await request(app.callback()).get('/characters/1011127')
  expect(response.status).toBe(200)
  expect(response.body).toStrictEqual({
    Id: 1011127,
    Name: 'Zodiak',
    Description: 'Twelve demons merged with Norman Harrison, who, soon after, adopted the guise of Zodiac and used his abilities to harness powers based on the astrological Zodiac.',
  })
})

test('return Not Found if no character found for id', async () => {
  const app = makeApp(mockCharacterService)
  const response = await request(app.callback()).get('/characters/1')
  expect(response.status).toBe(404)
})
