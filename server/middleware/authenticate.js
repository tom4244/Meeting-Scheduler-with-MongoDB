import jwt from 'jsonwebtoken';
import config from '../config';
const  { MongoClient } = require('mongodb');
const uri = "mongodb://127.0.0.1:27017";
let client;

// This looks at the token in the header and verifies it.
export default async (req, res, next) => {
	const authorizationHeader = req.headers['authorization'];
	let token;

	if (authorizationHeader) {
		token = authorizationHeader.split(' ')[1];
	}
	if (!(token)) {
	  res.status(403).json({
		error: 'No token provided'
	  });
	} else {
      jwt.verify(token, config.jwtSecret, (err, decoded) => {
        if (err) {
		    res.status(401).json({ error: 'Failed to authenticate' });
	    };
	  });
	
		// .select('id', 'username', 'email')
	  try {
        client = new MongoClient(uri);
		const database = client.db('meetings');
		const person = database.collection('person');
        await client.connect();
		const query = {username: decoded.id};
		const options = { projection: { _id: 0 }};
        const logger = await person.findOne(query, options); 
	  } catch(error) {
		  console.log("Error in authenticate.js:46: ", errors);
          res.status(500).json({ error: errors });
	  } finally {
		  await client.close();
	  }
      if (!(person)) {
        res.status(404).json({ error: 'No such user' });
	  } else {
		  req.currentUser = user;
	  }
	}
}

