import config from './config.js'
import CharacterService from './characterService.js'
import JsonCharacterRepository from './jsonCharacterRepository.js'
import Marvel from './marvel.js'
import makeApp from './app.js'


const marvel = new Marvel({
  baseEndpoint: config.marvel.baseEndpoint,
  privateKey: config.marvel.privateKey,
  publicKey: config.marvel.publicKey,
})

const characterRepository = new JsonCharacterRepository('db.json')

const maxLimit = config.marvel.maxLimit
const characterService = new CharacterService(characterRepository, marvel, maxLimit)


const app = makeApp(characterService)

const port = config.app.port
app.listen(port)
console.log('listening on port ' + port)
