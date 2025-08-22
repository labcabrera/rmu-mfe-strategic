export async function fetchProfessions() {
  const url = `${process.env.RMU_API_CORE_URL}/professions`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}
