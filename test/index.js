'use strict';

let assert = require('assert');
let pg = require('..');

const config = 'postgres://hx@localhost/hx';

describe('## pg-then', function() {
  describe('# Pool', function() {
    let pool;

    it('new pool', function(done) {
      pool = pg.Pool(config);

      setTimeout(done, 1000);
    });

    it('query', function() {
      return pool.query('SELECT 1 AS count').then(function(result) {
        assert.equal(result.rowCount, 1);
        assert.equal(result.rows[0].count, 1);
      });
    });
  });

  describe('# Client', function() {
    let client;

    it('new client', function(done) {
      client = pg.Client(config);

      setTimeout(done, 1000);
    });

    it('query', function() {
      return client.query('SELECT 1 AS count').then(function(result) {
        assert.equal(result.rowCount, 1);
        assert.equal(result.rows[0].count, 1);
        client.end();
      });
    });
  });
});
