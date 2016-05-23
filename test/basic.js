var inherits = require('util').inherits

var test = require('tap').test
var uuid = require('node-uuid')
var Bluebird = require('Bluebird')

var Adaptor = require('./lib/in-memory-adaptor.js')
var DAO = require('../lib/dao.js').default

test('completely generic DAO is unusable', function (t) {
  var dao = new DAO(new Adaptor())
  t.throws(
    function () {
      dao.save({ greeting: 'hi there' }, function () {
        t.fail('should not get this far')
        t.end()
      })
    },
    "Unimplemented! Add an ID generator to your DAO's prototype!"
  )
  t.end()
})

test('only really need to define an ID generator', function (t) {
  var sequence = 0
  function StuffDAO (db) {
    DAO.call(this, db)
  }
  inherits(StuffDAO, DAO)

  StuffDAO.prototype.generateID = function (pojo) {
    var id = '' + sequence++
    pojo[DAO.idSymbol] = id
    return id
  }

  var dao = new StuffDAO(new Adaptor())

  dao.save({ stuff: 'is good' }, function (err) {
    t.ifErr(err, 'in-memory adaptor saves without error')

    dao.save({ stuff: 'kinda sucks' }, function (err) {
      t.ifErr(err, 'in-memory adaptor saves without error')

      dao.findAll(function (err, loaded) {
        t.ifErr(err, 'really surprising if this fails')

        t.is(loaded.length, 2)

        // can rely on the in-memory adaptor keeping things in the order they were added
        t.is(loaded[0][DAO.idSymbol], '0', 'ID made it through')
        t.is(loaded[0].stuff, 'is good', 'value made it through')

        t.is(loaded[1][DAO.idSymbol], '1', 'ID made it through')
        t.is(loaded[1].stuff, 'kinda sucks', 'value made it through')

        t.end()
      })
    })
  })
})

test('findAll reconstitutes properly', function (t) {
  function ThingerDAO (db) {
    DAO.call(this, db)
  }
  inherits(ThingerDAO, DAO)

  ThingerDAO.prototype.generateID = function (pojo) {
    var id = uuid()
    pojo[DAO.idSymbol] = id
    return id
  }

  ThingerDAO.prototype._serialize = function (toSave, cb) {
    var dehydrated = { category: toSave.type }
    dehydrated[DAO.idSymbol] = this.generateID(toSave)
    return Bluebird.resolve(dehydrated).nodeify(cb)
  }

  ThingerDAO.prototype._deserialize = function (loaded, cb) {
    var rehydrated = new Thinger(loaded.category)
    rehydrated[DAO.idSymbol] = loaded[DAO.idSymbol]
    return Bluebird.resolve(rehydrated).nodeify(cb)
  }

  function Thinger (type) {
    this.type = type
  }

  var adaptor = new Adaptor()
  var dao = new ThingerDAO(adaptor)

  var types = ['band', 'album']
  var created = Bluebird.map(
    types,
    function (type) {
      return dao.save(new Thinger(type))
    }
  )

  var reloaded = created.then(function () { return dao.findAll() })

  return reloaded.then(function (things) {
    t.is(things.length, 2)
    things.forEach(function (v) {
      t.ok(types.indexOf(v.type) > -1, v.type + ' is one of the saved types')
    })
  })
  .finally(function () { return dao.closeDB() })
})
