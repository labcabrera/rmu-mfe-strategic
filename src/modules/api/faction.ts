import { buildErrorFromResponse } from './api-errors';
import { CreateFactionDto, Faction, UpdateFactionDto } from './faction.dto';

export async function fetchFaction(factionId: string): Promise<Faction> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/factions/${factionId}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchFactions(rsql: string, page: number, size: number): Promise<Faction[]> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/factions?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const pageContent = await response.json();
  return pageContent.content as Faction[];
}

export async function createFaction(data: CreateFactionDto): Promise<Faction> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/factions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (response.status !== 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function updateFaction(factionId: string, data: UpdateFactionDto): Promise<Faction> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/factions/${factionId}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteFaction(factionId: string): Promise<void> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/factions/${factionId}`;
  const response = await fetch(url, { method: 'DELETE' });
  if (response.status !== 204) {
    throw await buildErrorFromResponse(response, url);
  }
}

export async function addFactionXP(factionId: string, amount: number): Promise<Faction> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/factions/${factionId}/add-xp`;
  const body = { xp: amount };
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function addFactionGold(factionId: string, amount: number): Promise<Faction> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/factions/${factionId}/add-gold`;
  const body = { gold: amount };
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}
