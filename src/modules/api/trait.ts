import { getAuthHeaders } from '../services/auth-token-service';
import { apiCoreUrl } from '../services/config';
import { buildErrorFromResponse } from './api-errors';
import { Trait } from './trait.dto';

export async function fetchTrait(traitId: string): Promise<Trait> {
  const url = `${apiCoreUrl}/traits/${traitId}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const json = await response.json();
  return json as Trait;
}

export async function fetchTraits(query: string, page: number, size: number): Promise<Trait[]> {
  const url = `${apiCoreUrl}/traits?q=${query}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const json = await response.json();
  return json.content as Trait[];
}
