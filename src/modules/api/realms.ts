import { buildErrorFromResponse } from './api-errors';

export interface Realm {
  id: string;
  name: string;
  [key: string]: any;
}

export async function fetchRealms(): Promise<Realm[]> {
  const url = `${process.env.RMU_API_CORE_URL}/realms`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return (await response.json()) as Realm[];
}

export async function fetchRealm(realmId: string): Promise<Realm> {
  const url = `${process.env.RMU_API_CORE_URL}/realms/${realmId}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return (await response.json()) as Realm;
}
