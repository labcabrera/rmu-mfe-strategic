import { buildErrorFromResponse } from './api-errors';

export interface Profession {
  id: string;
  name: string;
  professionalSkills: string[];
  [key: string]: any;
}

export async function fetchProfession(id: string): Promise<Profession> {
  const url = `${process.env.RMU_API_CORE_URL}/professions/${id}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return (await response.json()) as Profession;
}

export async function fetchProfessions(): Promise<Profession[]> {
  const url = `${process.env.RMU_API_CORE_URL}/professions`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return (await response.json()) as Profession[];
}
