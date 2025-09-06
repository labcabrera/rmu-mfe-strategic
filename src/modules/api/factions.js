import { buildErrorFromResponse } from './api-errors';

export async function fetchFaction(factionId) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/factions/${factionId}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status != 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchFactions(rsql, page, size) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/factions?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status != 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const pageContent = await response.json();
  return pageContent.content;
}

export async function createFaction(data) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/factions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (response.status != 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function updateFaction(factionId, data) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/factions/${factionId}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (response.status != 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteFaction(factionId) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/factions/${factionId}`;
  const response = await fetch(url, { method: 'DELETE' });
  if (response.status !== 204) {
    throw await buildErrorFromResponse(response, url);
  }
}

export async function addFactionXP(factionId, amount) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/factions/${factionId}/add-xp`;
  const body = { xp: amount };
  const response = await fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
  if (response.status != 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function addFactionGold(factionId, amount) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/factions/${factionId}/add-gold`;
  const body = { gold: amount };
  const response = await fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
  if (response.status != 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}
