import { getAuthHeaders } from '../services/auth-token-service';
import { apiTacticalUrl } from '../services/config';
import { buildErrorFromResponse } from './api-errors';

export interface TacticalGame {
  id: string;
  strategicGameId: string;
  name: string;
  factions: string[];
  description: string;
  imageUrl: string;
}

export async function fetchTacticalGames(rsql: string, page: number, size: number): Promise<TacticalGame[]> {
  const url = `${apiTacticalUrl}/tactical-games?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const pageContent = await response.json();
  return pageContent.content as TacticalGame[];
}
