export default class CharacterService {
  constructor(characterRepository, marvel, maxLimit) {
    this.characterRepository = characterRepository
    this.marvel = marvel
    this.maxLimit = maxLimit
  }

  async all() {
    await this.syncWithRemote()
    return this.characterRepository.all()
  }

  async find(id) {
    const localCharacter = this.characterRepository.find(id)

    if (localCharacter !== undefined) {
      return localCharacter
    }

    const json = await this.marvel.getCharacter(id)

    if (json.data.results.length === 0) {
      return undefined
    }

    const now = new Date()
    const remoteCharacter = json.data.results[0]

    const value = {
      name: remoteCharacter.name,
      description: remoteCharacter.description,
      modified: remoteCharacter.modified,
      fetched: now,
    }
    console.log('update or insert', id, value)
    this.characterRepository.insertOrUpdate(id, value)
    this.characterRepository.save()

    return value
  }

  async syncWithRemote() {
    const maxModified = this.characterRepository.maxModified()
    console.log('maxModified', maxModified)

    await this.fetchFromRemote(maxModified, this.maxLimit)
  }

  async fetchFromRemote(maxModified, limit, offset = 0) {
    const params = {}

    // order by `modified`, followed by `name`
    // to make sure fetching by paging is consistent
    // and not miss out records
    params.orderBy = 'modified,name'

    params.limit = limit
    params.offset = offset

    if (maxModified.getTime() > 0) {
      // we will query Marvel API with modifiedSince
      // one day before the latest modified we currently have in the cache
      const d = new Date(maxModified.getTime())
      d.setDate(d.getDate() - 1)

      // date format YYYY-MM-DD
      params.modifiedSince = d.toISOString().split('T')[0]

      console.log('Retrieving characters modified since %s ...', params.modifiedSince)
    }

    const json = await this.marvel.getCharacters(params)

    const now = new Date()

    const characters = json.data.results
    characters.forEach(character => {
      const id = character.id

      const localCharacter = this.characterRepository.find(id)
      if (localCharacter !== undefined) {
        const localModified = new Date(localCharacter.modified)
        const remoteModified = new Date(character.modified)

        if (remoteModified.getTime() === localModified.getTime()) {
          // we have the latest character information
          // no need to update local cache
          return
        }
      }

      const value = {
        name: character.name,
        description: character.description,
        modified: character.modified,
        fetched: now,
      }
      console.log('update or insert', id, value)
      this.characterRepository.insertOrUpdate(id, value)
    })

    this.characterRepository.save()

    console.log('offset', json.data.offset)
    console.log('count', json.data.count)
    console.log('total', json.data.total)

    // if count (e.g. 100) is equal to limit (e.g. 100)
    // then may have more records to fetch
    if (json.data.count >= limit) {
      await this.fetchFromRemote(maxModified, limit, offset + limit)
    }
  }
}
