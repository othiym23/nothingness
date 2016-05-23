import assert from 'assert'

import Bluebird from 'bluebird'

export default class DAO {
  constructor (adaptor) {
    this._save = Bluebird.promisify(adaptor.save, { context: adaptor })
    this._findAll = Bluebird.promisify(adaptor.findAll, { context: adaptor })
    this._closeDB = Bluebird.promisify(adaptor.closeDB, { context: adaptor })
  }

  save (pojo, cb) {
    return this._serialize(pojo)
      .then(serialized => {
        assert(
          serialized[DAO.idSymbol],
          'object to be saved must have an ID set'
        )

        return this._save(serialized[DAO.idSymbol], serialized)
      })
      .nodeify(cb)
  }

  findAll (cb) {
    return this._findAll()
      .map(v => this._deserialize(v))
      .nodeify(cb)
  }

  closeDB (cb) {
    return this._closeDB().nodeify(cb)
  }

  // serialization may require async actions
  _serialize (toSave, cb) {
    if (!toSave[DAO.idSymbol]) this.generateID(toSave)
    return Bluebird.resolve(toSave).nodeify(cb)
  }

  _deserialize (loaded, cb) {
    assert(loaded[DAO.idSymbol], 'adaptor must set ID for each loaded object')
    return Bluebird.resolve(loaded).nodeify(cb)
  }

  generateID () {
    throw new TypeError("Unimplemented! Add an ID generator to your DAO's prototype!")
  }
}

DAO.idSymbol = Symbol('DAO')
