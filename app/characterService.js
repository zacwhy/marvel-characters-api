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

    if (localCharacter) {
      return localCharacter
    }

    const remoteCharacter = await this.marvel.getCharacter(id)

    if (!remoteCharacter) {
      return null
    }

    const now = new Date()

    const value = {
      name: remoteCharacter.name,
      description: remoteCharacter.description,
      modified: remoteCharacter.modified,
      fetched: now,
    }

    this.characterRepository.insertOrUpdate(id, value)
    this.characterRepository.save()

    return value
  }

  /**
   * Syncing with remote Marvel API dataset
   *
   * Assumptions are that:
   *   - when there is new Marvel character added, the modified date will be
   *     set to that date
   *   - when there is an update to the character's attributes, the modified
   *     date will be updated to the new date
   *
   *
   * When there is no character data cached localled, the sync process will
   * begin by querying the remote Marvel API by using:
   *
   *   orderBy=modified,name & limit=100 & offset=0
   *
   * From the first response, we inspect the `data.count`. If the count is 100,
   * we will assume that there are more data to be fetched, and continue
   * fetching with a new offset:
   *
   *   orderBy=modified,name & limit=100 & offset=100
   *
   * This process will continue until `data.count` is less than 100. Then we
   * know there should be no more data left to fetch.
   *
   *
   * When we already have some cached data, the sync process will query the
   * remote Marvel API with the `modifiedSince` filter.
   *
   * We first get the maximum modified date from the cache. Then query the
   * Marvel API with:
   *
   *   modifiedSince = (maxModified as YYYY-MM-DD) - (1 day)
   *
   * We use one day before to make sure we do not miss out updates that was
   * made later in the same day as the maxModified date.
   */
  async syncWithRemote() {
    const maxModified = this.characterRepository.maxModified()
    // console.log('maxModified', maxModified)

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

      // console.log('Retrieving characters modified since %s ...', params.modifiedSince)
    }

    const response = await this.marvel.getCharacters(params)

    if (!response.ok) {
      console.error(response)
      console.error(await response.text())
      throw new Error('response not ok')
    }

    const json = await response.json()

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
      // console.log('update or insert', id, value)
      this.characterRepository.insertOrUpdate(id, value)
    })

    this.characterRepository.save()

    // console.log('offset', json.data.offset)
    // console.log('count', json.data.count)
    // console.log('total', json.data.total)

    // if count (e.g. 100) is equal to limit (e.g. 100)
    // then may have more records to fetch
    if (json.data.count >= limit) {
      await this.fetchFromRemote(maxModified, limit, offset + limit)
    }
  }
}
