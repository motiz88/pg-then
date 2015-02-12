'use strict';

let pg = require('pg');
let slice = [].slice;

exports.Client = Client;
exports.Pool = Pool;

/**
 * Pool
 */
function Pool(config) {
  if (!(this instanceof Pool)) {
    return new Pool(config);
  }

  let self = this;

  pg.connect(config, function(error, client, done) {
    if (error) {
      throw error;
    }

    self._client = client;
    self._done = done;
  });
}

Pool.prototype.query = function() {
  let args = slice.call(arguments);
  let self = this;

  return new Promise(function(resolve, reject) {
    let cb = function(error, result) {
      self._done();

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
