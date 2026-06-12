const express = require('express');
const router = express.Router();
const {
  getAllMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch
} = require('../controllers/matchController');

router.route('/')
  .get(getAllMatches)
  .post(createMatch);

router.route('/:id')
  .get(getMatchById)
  .put(updateMatch)
  .delete(deleteMatch);

module.exports = router;
