export async function fetchRealms() {
  const url = `${process.env.RMU_API_CORE_URL}/realms`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}
