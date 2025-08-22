export async function fetchStrategicGames(page, size) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/strategic-games?page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status != 200) {
    throw new Error(`Strategic fetch error response: ${response.statusText}. (${url})`);
  }
  const pageContent = await response.json();
  return pageContent.content;
}

export async function fetchStrategicGame(gameId) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/strategic-games/${gameId}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status != 200) {
    throw new Error(`Strategic fetch error response: ${response.statusText}. (${url})`);
  }
  return await response.json();
}

export async function deleteStrategicGame(gameId) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/strategic-games/${gameId}`;
  const response = await fetch(url, { method: 'DELETE' });
  if (response.status != 204) {
    throw new Error(`Strategic delete error response: ${response.statusText}. (${url})`);
  }
  return;
}
