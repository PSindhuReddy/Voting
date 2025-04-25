const express = require('express');
const router = express.Router();
const Election = require('../models/Election');

// Get all elections
router.get('/', async (req, res) => {
  const elections = await Election.find();
  res.json(elections);
});

// Create new election
router.post('/', async (req, res) => {
  try {
    const election = new Election(req.body);
    await election.save();
    res.status(201).json({ message: 'Election created successfully.' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to create election.' });
  }
});

module.exports = router;
