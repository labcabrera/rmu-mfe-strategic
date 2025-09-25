import { buildErrorFromResponse } from './api-errors';
import { Trait } from './trait.dto';

export async function fetchTrait(traitId: string): Promise<Trait> {
  const url = `${process.env.RMU_API_CORE_URL}/traits/${traitId}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const json = await response.json();
  return json as Trait;
}

export async function fetchTraits(query: string, page: number, size: number): Promise<Trait[]> {
  const url = `${process.env.RMU_API_CORE_URL}/traits?page=${page}&size=${size}&query=${query}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const json = await response.json();
  return json.content as Trait[];
}
