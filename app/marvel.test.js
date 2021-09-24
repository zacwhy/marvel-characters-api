import config from './config.js'
import Marvel from './marvel.js'

const marvel = new Marvel({
  baseEndpoint: config.marvel.baseEndpoint,
  privateKey: config.marvel.privateKey,
  publicKey: config.marvel.publicKey,
})

// Default to skip because the tests make http call to Marvel API
// To run these test, remove `.skip`

test.skip('fetches character by id', async () => {
  const response = await marvel.getCharacter(1011896)

  expect(response.data.results.length).toBe(1)
})

test.skip('fetches characters', async () => {
  const response = await marvel.getCharacters({
    orderBy: 'modified,name',
    limit: 100,
    offset: 200,
    // modifiedSince: '2000-01-01',
  })

  expect(response.data.results.length).toBeGreaterThan(1)
  expect(response.data.offset).toBe(200)
})
