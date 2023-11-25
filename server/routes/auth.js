import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config';
const  { MongoClient } = require('mongodb');
const uri = "mongodb://127.0.0.1:27017";
let client;

let router = express.Router();

router.post('/', async (req, res) => {
  const { identifier, password } = req.body;
  let user = {};
  try {
    client = new MongoClient(uri);
    const database = client.db('meetings');
    const person = database.collection('person');
	await client.connect();
	const query = { $or: [ { username: identifier }, { email: identifier } ] };
	const options = { projection: { _id: 0 }};
	user = await person.findOne(query, options);
  } catch(error) {
      console.log("Caught error in auth.js 29, findOne: ", error);
      res.status(500).json({ error: error });
  } finally {
	  await client.close();
  }
  // Note we are not returning the user's info here; 
  //   we are only either making a jwt token.
  if (bcrypt.compareSync(password, user.password_digest)) {
    const token = jwt.sign({
      id: user.id,
      username: user.username
    }, config.jwtSecret);
    res.json({
      token: token,
      firstname: user.firstname,
      lastname: user.lastname,
      roomname: user.roomname,
      mtgTypes: user.mtg_types,
	  photo: user.photo
    });
  } else {
  	  res.status(401).json({ errors: { form: 'Invalid Credentials' } });
  }
});

export default router;

