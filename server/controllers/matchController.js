const Match = require('../models/Match');
const { validateMatchInput } = require('../utils/validators');

/**
 * @desc    Get all recorded match summaries sorted by createdAt descending
 * @route   GET /api/matches
 * @access  Public
 */
exports.getAllMatches = async (req, res, next) => {
  try {
    const matches = await Match.find().sort({ createdAt: -1 });
    res.status(200).json(matches);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single match record by ID
 * @route   GET /api/matches/:id
 * @access  Public
 */
exports.getMatchById = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      res.status(404);
      throw new Error('Match not found');
    }
    res.status(200).json(match);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save completed match details and statistics
 * @route   POST /api/matches
 * @access  Public
 */
exports.createMatch = async (req, res, next) => {
  try {
    const { isValid, errors } = validateMatchInput(req.body);
    if (!isValid) {
      res.status(400);
      throw new Error(`Validation Error: ${errors.join(', ')}`);
    }

    const matchData = req.body;
    if (!matchData.createdAt) {
      matchData.createdAt = new Date();
    }

    const match = new Match(matchData);
    const savedMatch = await match.save();
    res.status(201).json(savedMatch);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a match record by ID
 * @route   PUT /api/matches/:id
 * @access  Public
 */
exports.updateMatch = async (req, res, next) => {
  try {
    const { isValid, errors } = validateMatchInput(req.body);
    if (!isValid) {
      res.status(400);
      throw new Error(`Validation Error: ${errors.join(', ')}`);
    }

    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedMatch) {
      res.status(404);
      throw new Error('Match not found');
    }

    res.status(200).json(updatedMatch);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a specific match record from the database by ID
 * @route   DELETE /api/matches/:id
 * @access  Public
 */
exports.deleteMatch = async (req, res, next) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);
    if (!match) {
      res.status(404);
      throw new Error('Match not found');
    }
    res.status(200).json({ message: 'Match deleted successfully' });
  } catch (error) {
    next(error);
  }
};
