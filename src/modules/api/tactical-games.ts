import { buildErrorFromResponse } from './api-errors';

export interface TacticalGame {
  id: string;
  name: string;
  [key: string]: any;
}

export async function fetchTacticalGames(rsql: string, page: number, size: number): Promise<TacticalGame[]> {
  const url = `${process.env.RMU_API_TACTICAL_URL}/tactical-games?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const pageContent = await response.json();
  return pageContent.content as TacticalGame[];
}
