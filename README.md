# nothingness
A small implementation of an abstract data access object base class. Intended for use with a project built on leveldb, but should work just fine with both relational and documented-oriented stores. Written using as many ES2015 idioms as I could comfortably pick up over the course of writing it.

## installation

```
npm install --save nothingness
```

## usage
Create a DAO:

```javascript
// thinger-dao.js

// using Babel's module loader for Node
import DAO from 'nothingness'
import { v4 as uuid } from 'node-uuid'

export default class ThingerDAO extends DAO {
  generateID (pojo) {
    // the #yolo uniqueness constraint
    const id = uuid()
    pojo[DAO.idSymbol] = id
    return id
  }
}
```

Use it to persist and load an object:

```javascript
// main.js
import ThingerDAO from './thinger-dao.js'
import assert from 'assert'
import Adaptor from '@nothingness/level'

const dao = new ThingerDAO(new Adaptor('./thinger-db'))
const thingy = { type: 'band' }

// uses Bluebird's .nodeify(), so callback or promise chain are fine
dao.save(thingy)
   .then(() => dao.findAll())
   .then(results => assert.deepEqual(
     results,
     [{ type: 'band' }],
     'should only have one item, of type "band"'
   ))
   .then(() => console.log('round trip succeeded!'))
   .catch(err => console.error(err.stack))
   .finally(() => dao.closeDB())
```

## caveats
1. Nothingness will attain unity as soon as possible; until then be prepared for fluxes in the void.
2. There is no validation in nothingness.
3. There is no ORM in nothingness.
4. There is no ODM in nothingness.
5. There is no SQL nor no-SQL in nothingness; there is only separation (of concerns) and absence (of concrete implementations).

## why
Sometimes the objects that are part of a persistence model are used in other parts of an application, and coupling the model to the persistence strategy means that those other packages may now have a bunch of dependencies they don't need. By using the [Data Mapper pattern](http://martinfowler.com/eaaCatalog/dataMapper.html), you can cleanly separate things and have a simpler application maybe?
