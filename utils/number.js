const percentage = (part, total, digitsAfterDot) => {
  return ((100 * part) / total).toFixed(digitsAfterDot);
};

const roundHundred = (value) => {
  return Math.round(value / 100) * 100;
};

module.exports = {
  percentage,
  roundHundred,
};
