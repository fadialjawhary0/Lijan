export const percentageFormat = percentage => {
  if (percentage === undefined || percentage === null || isNaN(percentage)) {
    return '0.00%';
  }
  return `${percentage.toFixed(2)}%`;
};
