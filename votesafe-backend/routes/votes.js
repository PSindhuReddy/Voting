const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const Election = require('../models/Election');

// Submit vote
router.post('/', async (req, res) => {
  try {
    const { userId, electionId, optionId } = req.body;

    if (!userId || !electionId || !optionId) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Prevent double voting
    const existingVote = await Vote.findOne({ userId, electionId });
    if (existingVote) {
      return res.status(400).json({ error: 'You have already voted.' });
    }

    // Record vote
    const vote = new Vote({ userId, electionId, optionId });
    await vote.save();

    // Increment vote count in election option
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ error: 'Election not found.' });
    }
    
    const optionIndex = election.options.findIndex(opt => opt.id === optionId);
    if (optionIndex === -1) {
      return res.status(404).json({ error: 'Option not found in this election.' });
    }
    
    election.options[optionIndex].votes += 1;
    await election.save();

    res.status(201).json({ message: 'Vote submitted successfully.' });
  } catch (error) {
    console.error('Vote submission error:', error);
    res.status(500).json({ error: 'Failed to submit vote.', details: error.message });
  }
});

// Get votes for a specific election
router.get('/election/:electionId', async (req, res) => {
  try {
    const votes = await Vote.find({ electionId: req.params.electionId });
    res.json(votes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch votes.' });
  }
});

module.exports = router;
