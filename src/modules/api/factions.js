export async function fetchFaction(factionId) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/factions/${factionId}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}

export async function deleteFaction(factionId) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/factions/${factionId}`;
  const response = await fetch(url, { method: 'DELETE' });
  if (response.status !== 204) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
}

export async function addFactionXP(factionId, amount) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/factions/${factionId}/add-xp`;
  const body = { xp: amount };
  const response = await fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}

export async function addFactionGold(factionId, amount) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/factions/${factionId}/add-gold`;
  const body = { gold: amount };
  const response = await fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}
