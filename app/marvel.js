import crypto from 'crypto'
import fetch from 'node-fetch'

export default class Marvel {
  constructor(config) {
    this.baseEndpoint = config.baseEndpoint
    this.privateKey = config.privateKey
    this.publicKey = config.publicKey
  }

  async getCharacter(id) {
    const path = '/v1/public/characters/' + id

    const response = await this.send(path, {})

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      // console.error(await response.text())
      throw new Error('response not ok')
    }

    const json = await response.json()

    if (json.data.results.length === 0) {
      return null
    }

    return json.data.results[0]
  }

  async getCharacters(params) {
    const path = '/v1/public/characters'
    return this.send(path, params)
  }

  async send(path, params) {
    const url = this.buildUrl(path, params)
    return await fetch(url)
  }

  buildUrl(path, params) {
    const ts = new Date().getTime()
    const hash = md5(ts + this.privateKey + this.publicKey)
    const endpoint = this.baseEndpoint + path

    const url = new URL(endpoint)
    url.searchParams.append('apikey', this.publicKey)
    url.searchParams.append('ts', ts)
    url.searchParams.append('hash', hash)

    if (params.orderBy !== undefined) {
      url.searchParams.append('orderBy', params.orderBy)
    }

    if (params.limit !== undefined) {
      url.searchParams.append('limit', params.limit)
    }

    if (params.offset !== undefined) {
      url.searchParams.append('offset', params.offset)
    }

    if (params.modifiedSince !== undefined) {
      url.searchParams.append('modifiedSince', params.modifiedSince)
    }

    return url
  }
}

function md5(contents) {
  return crypto.createHash('md5').update(contents).digest('hex')
}
