const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  id: String,
  name: String,
  votes: { type: Number, default: 0 }
});

const electionSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: { type: String, enum: ['candidate', 'referendum'] },
  startDate: Date,
  endDate: Date,
  options: [optionSchema],
  createdBy: String,
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'scheduled' }
});

module.exports = mongoose.model('Election', electionSchema);