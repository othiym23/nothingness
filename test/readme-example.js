var inherits = require('util').inherits

var join = require('path').join
var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var test = require('tap').test
var uuid = require('node-uuid').v4

var testDBpath = join(__dirname, 'readme-example')
var testDBfile = join(testDBpath, 'test.leveldb')

var Adaptor = require('@nothingness/level').default
var DAO = require('../lib/dao.js').default
function ThingerDAO (db) {
  DAO.call(this, db)
}
inherits(ThingerDAO, DAO)

ThingerDAO.prototype.generateID = function (pojo) {
  var id = uuid()
  pojo[DAO.idSymbol] = id
  return id
}

test('setup', function (t) {
  setup()
  t.end()
})

test('simple example from the README', function (t) {
  t.plan(1)

  var dao = new ThingerDAO(new Adaptor(testDBfile))
  var thingy = {
    type: 'band'
  }

  dao
    .save(thingy)
    .then(function () {
      dao.findAll().then(function (results) {
        t.same(results, [{ type: 'band' }], 'same in and out')
      })
    }).catch(function (err) {
      t.ifError(err, "shouldn't have exploded")
    })
})

test('cleanup', function (t) {
  cleanup()
  t.end()
})

function setup () {
  cleanup()
  mkdirp.sync(testDBpath)
}

function cleanup () {
  rimraf.sync(testDBpath)
}
