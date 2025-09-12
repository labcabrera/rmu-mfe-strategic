export async function buildErrorFromResponse(response: Response, url: string): Promise<Error> {
  try {
    const errorData = await response.json();
    const errorMessage = errorData.message || 'Unknown error';
    return new Error(errorMessage);
  } catch {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
}
