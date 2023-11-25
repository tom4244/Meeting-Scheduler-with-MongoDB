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
	const session_entry = database.collection('session_entry');
    const result = await session_entry.insertOne(req.body);
  } catch (errors) {
      res.status(500).json({ error: errors });
  } finally {
      await client.close();
  }
});

export default router;

