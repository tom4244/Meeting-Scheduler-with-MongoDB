import express from 'express';
import commonValidations from '../shared/validations/signup';
import bcrypt from 'bcryptjs';
import isEmpty from 'lodash/isEmpty';
import base64url from 'base64url';
import fs from 'fs-extra';
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb://127.0.0.1:27017";
let client;
var crypto = require('crypto');

let router = express.Router();
let user = "";
async function validateInput(data, otherValidations) {
  let { errors } = otherValidations(data);
  try { 
	client = new MongoClient(uri);
    await client.connect();
	const database = client.db('meetings');
    const person = database.collection('person');
    const query = { $or: [ { username: data.username}, { email: data.email} ] };
	const options = { projection: { _id: 0 }};
    user = await person.findOne( query, options );
  } catch (error){
      console.log("Error caught at the end of user.js validateInput: ", error);
  } finally {
      await client.close();
  }
  if (user != null) {
  	if (user.username == data.username) {
  	  errors.username = 'Someone has already chosen the username ' + data.username + '.';
  	}
  	if (user.email == data.email) {
  	  errors.email = 'There is already an account with this email address.';
  	}
  }
  return {
    errors,
  	isValid: isEmpty(errors)
  };
}

function randomStringAsBase64Url(size) {
  return base64url(crypto.randomBytes(size));
}

router.get('/', async(req, res) => {
  try {
	client = new MongoClient(uri);
    await client.connect();
    const database = client.db('meetings');
    const person = database.collection('person');
	const query = {} // get the whole collection
	const options = { projection: { _id: 0 }};
	const cursor = person.find(query, options);
	const participantsList = await cursor.toArray();
	res.json({ participantsList });
  } finally {
    await client.close();
  }
});

async function getPerson(identifier ) {
  try {
    client = new MongoClient(uri);
    await client.connect();
    const database = client.db('meetings');
    const person = database.collection('person');
	const query = { $or: [ { username: identifier }, { email: identifier } ] }
	const options = { projection: { _id: 0 }};
	return await person.findOne(query, options);
  } finally {
    await client.close();
  }
}
router.get('/:identifier', async(req, res) => {
  try {
    const { identifier } = req.body;
	client = new MongoClient(uri);
    await client.connect();
    const database = client.db('meetings');
    const person = database.collection('person');
    let user = await getPerson(identifier );
    res.json({
	  id: user.id,
      username: user.username,
	  email: user.email,
	  firstname: user.firstname,
	  lastname: user.lastname,
	  roomname: user.roomname,
	  mtgTypes: user.mtgTypes
    });
  } catch(err) {
    console.log("Error in users.js router.get /:identifier: ", err);
	res.status(401).json({ errors: err });
  } finally {
    await client.close();
  }
});

//This is for the userSignUpRequest in signUpForm.js
router.post('/', async(req, res) => {
	
  const object = await validateInput(req.body, commonValidations);
  let { errors, isValid } = object;
  if (isValid) {
    const userdata = req.body;
    userdata.roomname = randomStringAsBase64Url(8);
	const { username, password, email, firstname, lastname, roomname, mtgTypes} = userdata;
	const password_digest = bcrypt.hashSync(password, 10);
	//Make a new user entry in the database
    fs.copy(__dirname + '/../../src/app/img/userPhotos/anonymous.jpg', __dirname + '/../../src/app/img/userPhotos/' + username + '/' + username + '.jpg')
    fs.copy(__dirname + '/../selfIntros/anonymous.txt', __dirname + '/../selfIntros/' + username + '.txt')
	.then(() => {
	  console.log("anonymous photo and self-intro files copied")
	})
    .catch(error => {
	  console.log("Error in users.js during fs.copy: ", error)
    });
	try {
	  client = new MongoClient(uri);
      await client.connect();
	  const database = client.db('meetings');
	  const person = database.collection('person');
	  const doc = { username: username, email: email, password_digest: password_digest, firstname: firstname, lastname: lastname, roomname: roomname, mtg_types: mtgTypes, self_intro: username + '.txt', photo: username + '.jpg'} 
	  const result = await person.insertOne(doc);
      res.json({ success: true });
	} catch (error) {
	    console.log("Caught error in user.js 176, insertOne: ", error);
	    res.status(500).json({ error: error });
    } finally {
        await client.close();
    } 
  }	else { // (!isValid) 
      // errors = errors + "Input not valid in users.js";
	  try {
	    throw {error: errors};
	  }
	  catch (err) {
        console.log("errors at the end of users.js line 149: ", err);
  	    res.status(400).send({
		  status: 400,
		  message: err,
		  type: 'internal'
		}) 
	  }
  }
});

export default router;

