export async function fetchStrategicGames(rsql, page, size) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/strategic-games?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  const pageContent = await response.json();
  return pageContent.content;
}

export async function fetchStrategicGame(gameId) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/strategic-games/${gameId}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}

export async function createStrategicGame(gameData) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/strategic-games`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameData),
  });
  if (response.status != 201) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}

export async function deleteStrategicGame(gameId) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/strategic-games/${gameId}`;
  const response = await fetch(url, { method: 'DELETE' });
  if (response.status != 204) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return;
}
