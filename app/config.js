import fs from 'fs'

const configPath = 'config.json'

if (!fs.existsSync(configPath)) {
  throw new Error(configPath + ' file is not found')
}

const config = JSON.parse(fs.readFileSync(configPath))

export default config
