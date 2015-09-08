import Promise from 'bluebird'

export default class DAO {
  constructor (adaptor) {
    this._save = Promise.promisify(adaptor.save, adaptor)
    this._findAll = Promise.promisify(adaptor.findAll, adaptor)
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

  generateID () {
    throw new TypeError("Unimplemented! Add an ID generator to your DAO's prototype!")
  }
}

DAO.idSymbol = Symbol()
