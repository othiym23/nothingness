// using Babel's module loader for Node
import DAO from '..'
import { v4 as uuid } from 'node-uuid'

export default class ThingerDAO extends DAO {
  constructor (db) {
    super(db)
  }

  generateID (pojo) {
    // the #yolo uniqueness constraint
    const id = uuid()
    pojo[DAO.idSymbol] = id
    return id
  }
}
