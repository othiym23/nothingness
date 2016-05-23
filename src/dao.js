import Bluebird from 'bluebird'

export default class DAO {
  constructor (adaptor) {
    this._save = Bluebird.promisify(adaptor.save, { context: adaptor })
    this._findAll = Bluebird.promisify(adaptor.findAll, { context: adaptor })
    this._closeDB = Bluebird.promisify(adaptor.closeDB, { context: adaptor })
  }

  save (pojo, cb) {
    if (!pojo[DAO.idSymbol]) this.generateID(pojo)
    if (!pojo[DAO.idSymbol]) {
      throw new Error('generateID did not mutate the to-be-serialized object with DAO.idSymbol!')
    }

    return this._save(pojo[DAO.idSymbol], pojo).nodeify(cb)
  }

  findAll (cb) {
    return this._findAll().nodeify(cb)
  }

  closeDB (cb) {
    return this._closeDB().nodeify(cb)
  }

  generateID () {
    throw new TypeError("Unimplemented! Add an ID generator to your DAO's prototype!")
  }
}

DAO.idSymbol = Symbol()
