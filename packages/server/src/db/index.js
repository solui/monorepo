import EventEmitter from 'eventemitter3'
import { addDays } from 'date-fns'
import { _ } from '@solui/utils'
import knex from 'knex'

import * as packageMethods from './packages'
import * as userMethods from './users'

export const tsStr = ({ add = 0 } = {}) => {
  let d = new Date()

  if (0 < add) {
    d = addDays(d, add)
  }

  return d.toISOString()
}

const mapKeyMapper = (_ignore, key) => _.camelCase(key)

class Db extends EventEmitter {
  constructor ({ config, log }) {
    super()

    this._knex = knex({
      ...config.DB,
      postProcessResponse: this._postProcessDbResponse.bind(this),
      wrapIdentifier: this._wrapDbIdentifier.bind(this)
    })
    this._log = log.create('db')

    ;[ packageMethods, userMethods ].forEach(methods => {
      Object.entries(methods).forEach(([ methodName, fn ]) => {
        this[methodName] = fn.bind(this)
      })
    })
  }

  async shutdown () {
    await this._knex.destroy()
  }

  _db () {
    return this._knex
  }

  async _dbTransSerialized (cb) {
    return new Promise((resolve, reject) => {
      const __tryTransaction = async () => {
        try {
          this._log.debug('BEGIN TRANSACTION ...')

          const ret = await this._db().transaction(async trx => {
            await this._db()
              .raw('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE')
              .transacting(trx)

            try {
              const result = await cb(trx)
              this._log.debug('... COMMIT :)')
              await trx.commit(result)
            } catch (err) {
              this._log.warn(err)
              this._log.debug('... ROLLBACK :/')
              await trx.rollback(err)
            }
          })

          resolve(ret)
        } catch (err) {
          // if it was due to transaction serialization error then retry the transaction
          // see https://www.postgresql.org/docs/9.5/transaction-iso.html
          if (err.toString().includes('could not serialize access')) {
            this._log.debug('... AUTO-RETRY TRANSACTION ....')
            __tryTransaction()
          } else {
            reject(err)
          }
        }
      }

      // kick things off
      __tryTransaction()
    })
  }

  async _dbTrans (cb) {
    this._log.debug('BEGIN TRANSACTION ...')

    return this._db().transaction(async trx => {
      try {
        const result = await cb(trx)
        this._log.debug('... COMMIT :)')
        await trx.commit(result)
      } catch (err) {
        this._log.warn(err)
        this._log.debug('... ROLLBACK :/')
        await trx.rollback(err)
      }
    })
  }

  _extractReturnedDbIds (rows) {
    return rows.map(r => Object.values(r).join(''))
  }

  _postProcessDbResponse (result) {
    if (Array.isArray(result) || Array.isArray(result.rows)) {
      return (result.rows || result).map(row => (
        _.mapValues(_.mapKeys(row, mapKeyMapper), o => (
          (o instanceof Date) ? o.toISOString() : o
        ))
      ))
    }

    return result
  }

  _wrapDbIdentifier (value, origImpl) {
    return origImpl('*' === value ? '*' : _.snakeCase(value))
  }
}

export const createDb = ({ config, log }) => new Db({ config, log })
