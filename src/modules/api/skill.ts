import { buildErrorFromResponse } from './api-errors';
import { Skill } from './skill.dto';

export async function fetchSkills(): Promise<Skill[]> {
  const url = `${process.env.RMU_API_CORE_URL}/skills?page=0&size=1000`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const json = await response.json();
  return json.content as Skill[];
}
