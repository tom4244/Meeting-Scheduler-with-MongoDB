import express from 'express';
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb://127.0.0.1:27017";
import path from 'path';
let client;

let router = express.Router();
const multer = require('multer');
var fs = require('fs-extra'); 
// configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './src/app/img/userPhotos/');
  },
  filename: (req, file, cb) => {
    // The file name will be available as
    // req.file.pathname in the router handler.
    cb(null, req.body.name);
  },
});

const upload = multer({ storage });

router.post('/', upload.single('selectedPhotoFile'), async(req, res) => {
  try {
    client = new MongoClient(uri);
	await client.connect();
	const database = client.db('meetings');
	const person = database.collection('person');
    const result = await person.updateOne({username: req.body.user}, {$set: {photo: req.body.name}});
	result => res.json({success: true, msg: result });
  } catch (error) {
      error => res.status(500).json({ error: error});
  } finally {
      await client.close();
  }
});

router.get('/', (req, res) => {
	const imgfilename = req.query.photo;
	const imgfile = __dirname + '/../../src/app/img/userPhotos/' + imgfilename;
	res.setHeader('Content-disposition', 'attachment; filename=' + imgfilename);
	const mime = require('mime');
	const mimetype = 'image/jpeg';
	res.setHeader('Content-type', mimetype);
	res.sendFile(path.resolve(imgfile), function(error) {
	  if (!error) {
	    fs.unlink(imgfile);
	  } else {
		  console.log("Error in file download to server in uploadPhoto 53: ", error);
		}
	});
	
});


export default router;
