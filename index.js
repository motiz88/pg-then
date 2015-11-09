
'use strict'

const pg = require('pg')
const slice = [].slice

module.exports = {
  Client,
  Pool,
  pg
}

/**
 * Pool
 */

function Pool(config) {
  if (!(this instanceof Pool)) {
    return new Pool(config)
  }

  this.config = config
}

Pool.prototype.connect = function() {
  return new Promise((resolve, reject) => {
    pg.connect(this.config, (error, client, done) => {
      if (error) {
        done(error)
        reject(error)
        return
      }

      resolve({ client, done })
    })
  })
}

Pool.prototype.query = function() {
  const args = slice.call(arguments)

  return this.connect().then((pool) => {
    return new Promise((resolve, reject) => {
      const cb = (error, result) => {
        pool.done()

        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      }

      args.push(cb)

      pool.client.query.apply(pool.client, args)
    })
  })
}

/**
 * Client
 */
function Client(config) {
  if (!(this instanceof Client)) {
    return new Client(config)
  }

  this._client = new pg.Client(config)
  this._client.connect((error) => {
    if (error) {
      throw error
    }
  })
}

Client.prototype.query = function() {
  const args = slice.call(arguments)

  return new Promise((resolve, reject) => {
    const cb = (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    }

    args.push(cb)

    this._client.query.apply(this._client, args)
  })
}

Client.prototype.end = function() {
  this._client.end()
}
