import { getAuthHeaders } from '../services/auth-token-service';
import { apiNpcNames } from '../services/config';
import { buildErrorFromResponse } from './api-errors';

export async function fetchRandomName(race: string | undefined, gender: string | undefined): Promise<string> {
  const url = `${apiNpcNames}/random-names?race=${race || 'generic'}&gender=${gender || 'male'}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const json = await response.json();
  return json.name as string;
}
