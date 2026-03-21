import { getAuthHeaders } from '../services/auth-token-service';
import { apiCoreUrl } from '../services/config';
import { buildErrorFromResponse } from './api-errors';
import { Page } from './common.dto';

export interface Profession {
  id: string;
  name: string;
  availableRealmTypes: string[];
  fixedRealmTypes: string[];
  professionalSkills: string[];
  skillCosts: Record<string, number[]>;
  [key: string]: any;
}

export async function fetchProfession(id: string): Promise<Profession> {
  const url = `${apiCoreUrl}/professions/${id}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const json = await response.json();
  return json;
}

export async function fetchProfessions(): Promise<Page<Profession>> {
  const url = `${apiCoreUrl}/professions`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const json = await response.json();
  return json;
}
