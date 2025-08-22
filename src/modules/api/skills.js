export async function fetchSkills() {
  const url = `${process.env.RMU_API_CORE_URL}/skills`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}
