var join = require('path').join
var inherits = require('util').inherits

var mkdirpAsync = require('mkdirp')
var rimrafAsync = require('rimraf')
var test = require('tap').test
var uuid = require('node-uuid').v4
var Bluebird = require('bluebird')

var mkdirp = Bluebird.promisify(mkdirpAsync)
var rimraf = Bluebird.promisify(rimrafAsync)

var Adaptor = require('@nothingness/level').default
var DAO = require('../lib/dao.js').default

var PLAYGROUND = join(__dirname, 'test-readme-example')

function ThingerDAO (db) {
  DAO.call(this, db)
}
inherits(ThingerDAO, DAO)

ThingerDAO.prototype.generateID = function (pojo) {
  var id = uuid()
  pojo[DAO.idSymbol] = id
  return id
}

test('setup', setup)

test('simple example from the README', function (t) {
  // must pass in DAO.idSymbol to resolve circular dependency
  var dao = new ThingerDAO(new Adaptor(PLAYGROUND, DAO.idSymbol))
  var thingy = {
    type: 'band'
  }

  dao
    .save(thingy)
    .then(function () {
      return dao.findAll().then(function (results) {
        t.same(results, [{ type: 'band' }], 'same in and out')
      })
    }).catch(function (err) {
      t.ifError(err, "shouldn't have exploded")
    }).finally(function () {
      return dao.closeDB().then(function () { t.end() })
    })
})

test('cleanup', cleanup)

function cleanup () {
  return rimraf(PLAYGROUND)
}

function setup () {
  return cleanup()
    .then(function () { return mkdirp(PLAYGROUND) })
}
