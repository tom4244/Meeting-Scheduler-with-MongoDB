import express from 'express';
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb://127.0.0.1:27017";
let client;

let router = express.Router();

router.post('/', async(req, res) => {
  try {
    client = new MongoClient(uri);
    await client.connect();
    const database = client.db('meetings');
    const person = database.collection('person');
    const result = await person.updateOne({username: req.body.user}, {$set: {mtg_types: req.body.mtg_types}});
    result => res.json({success: true, msg: result });
  } catch (error) {
      error => res.status(500).json({ error: error});
  } finally {
      await client.close();
  }
});

router.get('/:user', async(req, res) => {
  try {
    client = new MongoClient(uri);
    await client.connect();
    const database = client.db('meetings');
    const person = database.collection('person');
    const data = await findOne({username: req.params.user}, {_id: 0, mtg_types: 1});
	res.json(data);
  } catch (error) {
      error => res.status(500).json({ error: error});
  } finally {
      await client.close();
  }

});

export default router;
