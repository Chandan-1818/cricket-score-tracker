const validateMatchInput = (data) => {
  const errors = [];

  const { team1, team2, overs, innings1, innings2, result } = data;

  if (!team1 || typeof team1 !== 'string' || team1.trim() === '') {
    errors.push('team1 is required and must be a non-empty string');
  }
  if (!team2 || typeof team2 !== 'string' || team2.trim() === '') {
    errors.push('team2 is required and must be a non-empty string');
  }
  if (team1 && team2 && team1.trim().toLowerCase() === team2.trim().toLowerCase()) {
    errors.push('team1 and team2 must be different teams');
  }
  if (!overs || typeof overs !== 'number' || overs <= 0) {
    errors.push('overs is required and must be a positive number');
  }
  if (!result || typeof result !== 'string' || result.trim() === '') {
    errors.push('result is required and must be a non-empty string');
  }

  const validateInnings = (innings, label) => {
    if (!innings || typeof innings !== 'object') {
      errors.push(`${label} is required and must be an object`);
      return;
    }
    if (!innings.battingTeam || typeof innings.battingTeam !== 'string' || innings.battingTeam.trim() === '') {
      errors.push(`${label}.battingTeam is required`);
    }
    if (!innings.bowlingTeam || typeof innings.bowlingTeam !== 'string' || innings.bowlingTeam.trim() === '') {
      errors.push(`${label}.bowlingTeam is required`);
    }
    if (typeof innings.score !== 'number' || innings.score < 0) {
      errors.push(`${label}.score must be a non-negative number`);
    }
    if (typeof innings.wickets !== 'number' || innings.wickets < 0) {
      errors.push(`${label}.wickets must be a non-negative number`);
    }
    if (typeof innings.balls !== 'number' || innings.balls < 0) {
      errors.push(`${label}.balls must be a non-negative number`);
    }
  };

  validateInnings(innings1, 'innings1');
  validateInnings(innings2, 'innings2');

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateMatchInput
};
