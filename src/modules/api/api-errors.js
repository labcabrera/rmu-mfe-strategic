export async function buildErrorFromResponse(response, url) {
  return response
    .json()
    .then((errorData) => {
      const errorMessage = errorData.message || 'Unknown error';
      return new Error(errorMessage);
    })
    .catch(() => {
      throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
    });
}
