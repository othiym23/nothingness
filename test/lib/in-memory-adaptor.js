function InMemoryAdaptor () {
  this.store = {}
}

InMemoryAdaptor.prototype = {
  save: function (k, v, cb) { this.store[k] = v; setTimeout(cb) },
  closeDB: function (cb) { setTimeout(cb) },
  findAll: function (cb) {
    var store = this.store
    setTimeout(
      function () { cb(null, Object.keys(store).map(function (k) { return store[k] })) }
    )
  }
}

module.exports = InMemoryAdaptor
