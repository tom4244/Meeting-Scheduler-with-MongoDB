import express from 'express';
const { MongoClient } = require('mongodb');
const uri = "mongodb://127.0.0.1:27017";
let client;

let router = express.Router();

router.get('/:user', async(req, res) => {
  const now = new Date();
  try {
    client = new MongoClient(uri);
    await client.connect();
    const database = client.db('meetings');
    const session = database.collection('session');
    const query = {$and: [{$or: [{'mtg_requester': req.params.user}, {students_string: {$regex: req.params.user}}]}, {endtime: {$lt: new Date()}}]};
    const options = { projection: { _id: 0 }};
    const cursor = session.find(query, options);
    const sessions_list = await cursor.toArray();
    res.json({ sessions_list });
  } catch (errors) {
      console.log("errors in pastClasses.js get :user: ", errors); 
      res.status(500).json({ error: errors});
  } finally {
      await client.close();
  }
});

export default router;

