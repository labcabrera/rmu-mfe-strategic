import { buildErrorFromResponse } from './api-errors';

export async function fetchCharacterSizes(): Promise<any> {
  const url = `${process.env.RMU_API_CORE_URL}/character-sizes`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}
