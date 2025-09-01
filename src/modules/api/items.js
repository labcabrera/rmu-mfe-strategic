export async function fetchItems() {
  const url = `${process.env.RMU_API_ITEMS_URL}/items?size=1000`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  const pageContent = await response.json();
  return pageContent.content;
}
