import { buildErrorFromResponse } from './api-errors';

export interface Skill {
  id: string;
  name: string;
  [key: string]: any;
}

export async function fetchSkills(): Promise<Skill[]> {
  const url = `${process.env.RMU_API_CORE_URL}/skills`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return (await response.json()) as Skill[];
}
