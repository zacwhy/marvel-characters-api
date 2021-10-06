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
    mockInsertOrUpdate.mockReset()
    mockSave.mockReset()
    // jest.clearAllMocks()
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

test('get all characters, and no characters in remote', async () => {
  const mockCharacterRepository = (() => ({
    all() {
      return {
      }
    },
    maxModified() {
      return new Date(0)
    },
    // find(id) {
    //   return null
    // },
    // insertOrUpdate: mockInsertOrUpdate,
    save: mockSave,
  }))()

  const mockMarvel = (() => ({
    async getCharacters(params) {
      return {
        ok: true,

        async json() {
          return {
            data: {
              offset: 0,
              count: 0,
              total: 0,
              results: [
                // {
                //   id: 1,
                //   name: 'name 1',
                //   description: 'description 1',
                //   modified: '2000-01-01T00:00:00Z',
                // },
              ]
            }
          }
        },

      }
    },
  }))()

  const characterService = new CharacterService(
    mockCharacterRepository,
    mockMarvel,
    100
  )

  const characters = await characterService.all()

  expect(characters).toStrictEqual({})
  expect(mockInsertOrUpdate).toHaveBeenCalledTimes(0)
  expect(mockSave).toHaveBeenCalledTimes(1)
})
