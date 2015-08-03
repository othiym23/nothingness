import level from 'level'
import DAO from '..'

// the dumbest possible leveldb adaptor
export default class Adaptor {
  constructor (path) {
    this.db = level(path, { valueEncoding: 'json' })
  }

  save (key, value, cb) {
    this.db.put(key, value, cb)
  }

  findAll (cb) {
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
}
