export async function fetchRandomName(race) {
  //TODO
  const url = `${process.env.RMU_API_NPC_NAMES_URL}/random?race=${race}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}
