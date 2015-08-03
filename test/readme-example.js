var inherits = require('util').inherits

var join = require('path').join
var level = require('level')
var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var test = require('tap').test
var uuid = require('node-uuid').v4

var testDBpath = join(__dirname, 'readme-example')
var testDBfile = join(testDBpath, 'test.leveldb')

var DAO = require('../lib/dao.js')
function ThingerDAO (db) {
  DAO.call(this, db)
}
inherits(ThingerDAO, DAO)

ThingerDAO.prototype.generateID = function (pojo) {
  var id = uuid()
  pojo[DAO.idSymbol] = id
  return id
}

// the dumbest possible leveldb adaptor
function NothingIsLevel (path) {
  this.db = level(path, { valueEncoding: 'json' })
}

NothingIsLevel.prototype.save = function save (key, value, cb) {
  this.db.put(key, value, cb)
}

NothingIsLevel.prototype.findAll = function findAll (cb) {
  var results = []
  this.db
    .createReadStream()
    .on('data', function (entry) {
      entry.value[DAO.idSymbol] = entry.key
      results.push(entry.value)
    })
    .on('end', function () { cb(null, results) })
    .on('error', cb)
}

test('setup', function (t) {
  setup()
  t.end()
})

test('simple example from the README', function (t) {
  t.plan(1)

  var dao = new ThingerDAO(new NothingIsLevel(testDBfile))
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
