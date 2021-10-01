import { jest } from '@jest/globals'
import CharacterService from './characterService.js'

const mockInsertOrUpdate = jest.fn()
const mockSave = jest.fn()

const mockMarvel = (() => ({
  async getCharacter(id) {
    return {
      name: 'name 1',
      description: 'description 1',
      modified: '2000-01-01T00:00:00Z',
    }
  },
}))()

afterEach(() => {
    jest.clearAllMocks()
})

test('find character that exist in repository', async () => {
  const mockCharacterRepository = (() => ({
    find(id) {
      return {
        name: 'name 1',
        description: 'description 1',
        modified: '2000-01-01T00:00:00Z',
      }
    },
    insertOrUpdate: mockInsertOrUpdate,
    save: mockSave,
  }))()

  const characterService = new CharacterService(
    mockCharacterRepository,
    mockMarvel,
    100
  )

  const character = await characterService.find(1)

  expect(character.name).toBe('name 1')
  expect(mockInsertOrUpdate).toHaveBeenCalledTimes(0)
  expect(mockSave).toHaveBeenCalledTimes(0)
})

test('find character that does not exist in repository', async () => {
  const mockCharacterRepository = (() => ({
    find(id) {
      return null
    },
    insertOrUpdate: mockInsertOrUpdate,
    save: mockSave,
  }))()

  const characterService = new CharacterService(
    mockCharacterRepository,
    mockMarvel,
    100
  )

  const character = await characterService.find(1)

  expect(character.name).toBe('name 1')
  expect(mockInsertOrUpdate).toHaveBeenCalledTimes(1)
  expect(mockSave).toHaveBeenCalledTimes(1)
})
