import express from 'express';
var fs = require('fs-extra');

let router = express.Router();
// Here the self intros are written to a file. The database isn't used.
router.post('/', (req, res) => {
  fs.writeFile(__dirname + '/../selfIntros/' + req.body.user + '.txt', req.body.selfIntro)  
  	.then(msg => res.json({success: true, msg: msg }))
  	.catch (errors => res.status(500).json({ error: errors}));
});

router.get('/:user', (req, res) => {
  fs.readFile(__dirname + '/../selfIntros/' + req.params.user + '.txt', 'utf8') 
  .then(text => {
    res.json({text})
	})
   .catch (errors => res.status(500).json({ error: errors}));
});	

export default router;
