import { getAuthHeaders, mergeJsonHeaders } from '../services/auth-token-service';
import { apiStrategicGameUrl } from '../services/config';
import { buildErrorFromResponse } from './api-errors';
import { Page } from './common.dto';
import { StrategicItem } from './strategic-item.dto';

export async function fetchStrategicItem(itemId: string): Promise<StrategicItem> {
  const url = `${apiStrategicGameUrl}/items/${itemId}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchStrategicItems(rsql: string, page: number, size: number): Promise<Page<StrategicItem>> {
  const url = `${apiStrategicGameUrl}/items?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function createStrategicItem(dto: Partial<StrategicItem>): Promise<StrategicItem> {
  const url = `${apiStrategicGameUrl}/items`;
  const response = await fetch(url, {
    method: 'POST',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(dto),
  });
  if (response.status !== 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function updateStrategicItem(gameId: string, dto: Partial<StrategicItem>): Promise<StrategicItem> {
  const url = `${apiStrategicGameUrl}/items/${gameId}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(dto),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteStrategicItem(gameId: string): Promise<void> {
  const url = `${apiStrategicGameUrl}/items/${gameId}`;
  const response = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() });
  if (response.status !== 204) {
    throw await buildErrorFromResponse(response, url);
  }
}
