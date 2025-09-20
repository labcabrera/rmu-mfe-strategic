import { buildErrorFromResponse } from './api-errors';
import { CreateStrategicGameDto, StrategicGame, UpdateStrategicGameDto } from './strategic-game.dto';

export async function fetchStrategicGames(rsql: string, page: number, size: number): Promise<StrategicGame[]> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/strategic-games?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const pageContent = await response.json();
  return pageContent.content as StrategicGame[];
}

export async function fetchStrategicGame(gameId: string): Promise<StrategicGame> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/strategic-games/${gameId}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return (await response.json()) as StrategicGame;
}

export async function createStrategicGame(gameData: CreateStrategicGameDto): Promise<StrategicGame> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/strategic-games`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameData),
  });
  if (response.status !== 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return (await response.json()) as StrategicGame;
}

export async function updateStrategicGame(gameId: string, gameData: UpdateStrategicGameDto): Promise<StrategicGame> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/strategic-games/${gameId}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameData),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return (await response.json()) as StrategicGame;
}

export async function deleteStrategicGame(gameId: string): Promise<void> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/strategic-games/${gameId}`;
  const response = await fetch(url, { method: 'DELETE' });
  if (response.status !== 204) {
    throw await buildErrorFromResponse(response, url);
  }
}
