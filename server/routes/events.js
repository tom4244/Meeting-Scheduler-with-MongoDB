import express from 'express';
import authenticate from '../middleware/authenticate';

let router = express.Router();

router.post('/', authenticate, (req, res) => {
	// An event can go here
	//   before giving status 201
	// Use the line below instead of 'success: true'
	//   to see information on who got authenticated
  // res.status(201).json({ user: req.currentUser });
  res.status(201).json({ success: true });
});

export default router;

