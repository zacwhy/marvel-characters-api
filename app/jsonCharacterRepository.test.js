import JsonCharacterRepository from './jsonCharacterRepository.js'

test('all functions', () => {
  const characterRepository = new JsonCharacterRepository('')


  // test insert() and all()
  characterRepository.insertOrUpdate(1, {
    name: 'name1',
    description: 'description1',
    modified: '2000-01-01T00:00:00Z',
  })

  characterRepository.insertOrUpdate(2, {
    name: 'name2',
    description: 'description2',
    modified: '2010-01-01T00:00:00Z',
  })

  const charactersMap = characterRepository.all()
  const ids = Object.keys(charactersMap)
  expect(ids.length).toBe(2)


  // test find()
  // TODO separate tests
  const character2 = characterRepository.find(2)
  expect(character2.name).toBe('name2')


  // test update()
  // TODO separate tests
  characterRepository.insertOrUpdate(2, {
    name: 'new name 2',
    description: 'description2',
    modified: '2010-01-01T00:00:00Z',
  })
  const newCharacter2 = characterRepository.find(2)
  expect(newCharacter2.name).toBe('new name 2')


  // test maxModified()
  // TODO separate tests
  const maxModified = characterRepository.maxModified()
  expect(maxModified.toISOString())
    .toBe(new Date('2010-01-01T00:00:00Z').toISOString())
})
