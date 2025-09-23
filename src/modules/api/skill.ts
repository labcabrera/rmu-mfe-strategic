import { buildErrorFromResponse } from './api-errors';
import { Skill } from './skill.dto';

export async function fetchSkills(): Promise<Skill[]> {
  const url = `${process.env.RMU_API_CORE_URL}/skills`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return (await response.json()) as Skill[];
}
