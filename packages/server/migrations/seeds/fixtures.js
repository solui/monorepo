const _ = require('lodash')
const { subDays, addDays } = require('date-fns')
const uuid = require('uuid/v4')
const { sha3 } = require('web3-utils')
const faker = require('faker')

const Ownable = require('./Ownable.json')
const spec = require('./spec.json')

const deleteTableData = (knex, tables) => (
  Promise.all(tables.map(table => (
    knex(table).del()
  )))
)

const buildSpec = id => {
  const s = { ...spec }
  s.id = `fixture-${id}-${faker.random.word()}`
  s.title = `Fixture ${faker.random.words(2)}`
  s.description = faker.random.words(25)
  return s
}

const buildData = id => ({
  spec: buildSpec(id),
  artifacts: {
    Ownable: _.pick(Ownable, [ 'abi', 'bytecode' ])
  }
})

const tsStr = ({ add = 0, sub = 0 } = {}) => {
  let d = new Date()

  if (0 < sub) {
    d = subDays(d, sub)
  } else if (0 < add) {
    d = addDays(d, add)
  }

  return d.toISOString()
}

exports.seed = async knex => {
  await deleteTableData(knex, [
    'bytecode_hash',
    'version',
    'package',
  ])
  // in user table delete everything except core admin user
  await knex('user').whereNot('is_admin', true).del()

  const [ user1Id, user2Id ] = [ uuid(), uuid() ]

  await knex('user').insert([
    { id: user1Id, username: faker.internet.userName(), email: 'tuser1@hiddentao.com', email_confirmed: true },
    { id: user2Id, username: faker.internet.userName(), email: 'tuser2@hiddentao.com', email_confirmed: true },
  ])

  const [ pkg1Id, pkg2Id, pkg3Id ] = [ uuid(), uuid(), uuid() ]

  await knex('package').insert([
    {
      id: pkg1Id,
      owner_id: user1Id,
      name: 'fixture-1',
    },
    {
      id: pkg2Id,
      owner_id: user2Id,
      name: 'fixture-2',
    },
    {
      id: pkg3Id,
      owner_id: user2Id,
      name: 'fixture-3',
    },
  ])

  const [ version1Id, version2Id, version3Id, version4Id, version5Id ] = [
    uuid(), uuid(), uuid(), uuid(), uuid()
  ]

  const versionsToInsert = [
    {
      id: version1Id,
      pkg_id: pkg1Id,
      data: buildData(1),
      created_at: tsStr({ add: 1 }),
    },
    {
      id: version2Id,
      pkg_id: pkg1Id,
      data: buildData(2),
      created_at: tsStr({ add: 2 }),
    },
    {
      id: version3Id,
      pkg_id: pkg2Id,
      data: buildData(3),
      created_at: tsStr({ add: 3 }),
    },
    {
      id: version4Id,
      pkg_id: pkg2Id,
      data: buildData(4),
      created_at: tsStr({ add: 4 }),
    },
    {
      id: version5Id,
      pkg_id: pkg3Id,
      data: buildData(5),
      created_at: tsStr({ add: 5 }),
    },
  ]

  versionsToInsert.forEach(v => {
    v.title = v.data.spec.title
    v.description = v.data.spec.description
    v.search = `${v.title} ${v.description}`.toLowerCase()
  })

  await knex('version').insert(versionsToInsert)

  const [ bhId1, bhId2, bhId3, bhId4, bhId5 ] = [ uuid(), uuid(), uuid(), uuid(), uuid() ]

  await knex('bytecode_hash').insert([
    {
      id: bhId1,
      hash: sha3(Ownable.bytecode),
      version_id: version1Id,
    },
    {
      id: bhId2,
      hash: sha3(Ownable.bytecode),
      version_id: version2Id,
    },
    {
      id: bhId3,
      hash: sha3(Ownable.bytecode),
      version_id: version3Id,
    },
    {
      id: bhId4,
      hash: sha3(Ownable.bytecode),
      version_id: version4Id,
    },
    {
      id: bhId5,
      hash: sha3(Ownable.bytecode),
      version_id: version5Id,
    },
  ])
}