import fs from 'fs'

export default class JsonCharacterRepository {
  constructor(databasePath) {
    this.databasePath = databasePath

    if (fs.existsSync(this.databasePath)) {
      const json = fs.readFileSync(this.databasePath)
      this.data = JSON.parse(json)
    } else {
      this.data = {
        characters: {}
      }
    }
  }

  all() {
    return this.data.characters
  }

  find(id) {
    return this.data.characters[id]
  }

  maxModified() {
    const max = Object.values(this.data.characters).reduce((previousValue, currentValue) => {
      const modified = new Date(currentValue.modified)

      // there may be records with invalid modified date string
      // e.g. "modified": "-0001-11-30T00:00:00-0500"
      //
      // then modified.getTime() will not be a number that can be compared
      if (isNaN(modified.getTime())) {
        return previousValue
      }

      return Math.max(previousValue, modified.getTime())
    }, 0)

    return new Date(max)
  }

  insertOrUpdate(id, value) {
    this.data.characters[id] = value
  }

  save() {
    const json = JSON.stringify(this.data, null, 2)
    fs.writeFile(this.databasePath, json, (err) => {
      if (err) {
        throw err
      }
      console.log('The file has been saved!')
    })
  }
}
