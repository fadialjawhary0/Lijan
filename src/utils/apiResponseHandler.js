export const isApiResponseSuccessful = response => {
  return response?.succeeded !== false && response?.httpStatusCode < 400;
};

export const getApiErrorMessage = (response, fallbackMessage = 'An error occurred') => {
  if (response?.errors && response.errors.length > 0) return response.errors[0];

  return fallbackMessage;
};

export const handleApiResponse = (response, onSuccess, onError, fallbackErrorMessage = 'An error occurred') => {
  if (isApiResponseSuccessful(response)) {
    onSuccess(response);
  } else {
    const errorMessage = getApiErrorMessage(response, fallbackErrorMessage);
    onError(new Error(errorMessage));
  }
};
