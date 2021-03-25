const percentage = (part, total, digitsAfterDot) => {
  return ((100 * part) / total).toFixed(digitsAfterDot);
};

module.exports = {
  percentage,
};
