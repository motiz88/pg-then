
'use strict';

const pg = require('pg');
const slice = [].slice;

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
    return new Pool(config);
  }

  this.config = config;
}

Pool.prototype.connect = function () {
  const self = this;

  return new Promise(function (resolve, reject) {
    pg.connect(self.config, function(error, client, done) {
      if (error) {
        done(error);
        reject(error);
        return;
      }

      resolve({ client, done });
    });
  });
}

Pool.prototype.query = function() {
  const args = slice.call(arguments);
  const self = this;

  return this.connect().then(function (pool) {
    return new Promise(function(resolve, reject) {
      const cb = function(error, result) {
        pool.done();

        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      };

      args.push(cb);

      pool.client.query.apply(pool.client, args);
    });
  });
};

/**
 * Client
 */
function Client(config) {
  if (!(this instanceof Client)) {
    return new Client(config);
  }

  this._client = new pg.Client(config);
  this._client.connect(function(error) {
    if (error) {
      throw error;
    }
  });
}

Client.prototype.query = function() {
  let args = slice.call(arguments);
  let self = this;

  return new Promise(function(resolve, reject) {
    let cb = function(error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    };
    args.push(cb);

    self._client.query.apply(self._client, args);
  });
};

Client.prototype.end = function() {
  this._client.end();
};
