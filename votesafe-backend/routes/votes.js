const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const Election = require('../models/Election');

// Submit vote
router.post('/', async (req, res) => {
  const { userId, electionId, optionId } = req.body;

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
  const option = election.options.find(opt => opt.id === optionId);
  if (option) option.votes += 1;
  await election.save();

  res.status(201).json({ message: 'Vote submitted.' });
});

module.exports = router;
