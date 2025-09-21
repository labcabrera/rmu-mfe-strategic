import { buildErrorFromResponse } from './api-errors';
import { Race } from './race.dto';

export async function fetchRaces(rsql: string, page: number, size: number): Promise<Race[]> {
  const url = `${process.env.RMU_API_CORE_URL}/races?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const json = await response.json();
  return json.content as Race[];
}
