const mongoose = require('mongoose');

const BatterStatsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  runs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 }
}, { _id: false });

const BowlerStatsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  overs: { type: String, default: '0.0' },
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  extras: { type: Number, default: 0 }
}, { _id: false });

const InningsSchema = new mongoose.Schema({
  battingTeam: { type: String, required: true },
  bowlingTeam: { type: String, required: true },
  score: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  batterStats: [BatterStatsSchema],
  bowlerStats: [BowlerStatsSchema]
}, { _id: false });

const MatchSchema = new mongoose.Schema({
  team1: { type: String, required: true },
  team2: { type: String, required: true },
  overs: { type: Number, required: true },
  tossWinner: { type: String },
  decision: { type: String },
  players: {
    team1: [{ type: String }],
    team2: [{ type: String }]
  },
  innings1: { type: InningsSchema, required: true },
  innings2: { type: InningsSchema, required: true },
  result: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', MatchSchema);
