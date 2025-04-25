// routes/election.js
const express = require('express');
const router = express.Router();
const Election = require('../models/Election');

// Get all elections
router.get('/', async (req, res) => {
  try {
    const elections = await Election.find();
    res.json(elections);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch elections.' });
  }
});

// Create new election
router.post('/', async (req, res) => {
  try {
    const election = new Election(req.body);
    await election.save();
    res.status(201).json({ message: 'Election created successfully.', election });
  } catch (err) {
    res.status(400).json({ error: 'Failed to create election.', details: err.message });
  }
});

// Get election by ID
router.get('/:id', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ error: 'Election not found.' });
    }
    res.json(election);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch election.' });
  }
});

module.exports = router;
