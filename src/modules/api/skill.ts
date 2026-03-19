import { getAuthHeaders } from '../services/auth-token-service';
import { apiCoreUrl } from '../services/config';
import { buildErrorFromResponse } from './api-errors';
import { Page } from './common.dto';
import { Skill } from './skill.dto';

export async function fetchSkills(categoryId?: string): Promise<Page<Skill>> {
  const categoryFilter = categoryId ? `&q=categoryId==${categoryId}` : '';
  const url = `${apiCoreUrl}/skills?page=0&size=1000${categoryFilter}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}
