import { buildErrorFromResponse } from './api-errors';

export async function fetchTacticalGames(rsql, page, size) {
  const url = `${process.env.RMU_API_TACTICAL_URL}/tactical-games?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status != 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const pageContent = await response.json();
  return pageContent.content;
}
