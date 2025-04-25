const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: String,
  electionId: String,
  optionId: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vote', voteSchema);