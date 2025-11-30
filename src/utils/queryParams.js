/**
 * Builds clean query parameters object, removing undefined, null, and empty string values
 * @param {Object} params - Parameters object
 * @returns {Object} Clean parameters object
 */
export const buildQueryParams = (params = {}) => {
  const cleanParams = {};

  Object.keys(params).forEach(key => {
    const value = params[key];
    // Only include if value is not undefined, null, or empty string
    if (value !== undefined && value !== null && value !== '') {
      cleanParams[key] = value;
    }
  });

  return cleanParams;
};
