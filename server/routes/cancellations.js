import express from 'express';
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb://127.0.0.1:27017";
let client;

let router = express.Router();
router.post('/', async(req,  res) => {
console.log("cancellations req.body[0]: ", req.body);
  try {
    client = new MongoClient(uri);
    await client.connect();
    const database = client.db('meetings');
    const session = database.collection('session');
    // const result = await session.deleteOne({id: {$regex: req.body[0]}});
    const result = await session.deleteMany({id: {$in: req.body}});
    res.json({success: true, msg: result});
  } catch (errors) {
      res.status(500).json({error: errors});
      console.log("Error deleting meeting in cancellations.js", errors);
  } finally {
      await client.close();
  }
});

export default router;
