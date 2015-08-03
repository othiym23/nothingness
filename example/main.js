import ThingerDAO from './thinger-dao.js'
import assert from 'assert'
import Adaptor from './nothingness-level.js'

const dao = new ThingerDAO(new Adaptor('./thinger-db'))
const thingy = { type: 'band' }

// uses Bluebird's .nodeify(), so callback or promise chain are fine
dao
  .save(thingy)
  .then(() => {
    dao
      .findAll()
      .then(results => assert.deepEqual(
        results,
        [{ type: 'band' }],
        'should only have one item, of type "band"'
      ))
      .then(() => console.log('assert succeeded!'))
      .catch(err => console.error(err.stack))
  })
