import { getAuthHeaders } from '../services/auth-token-service';
import { apiCoreUrl } from '../services/config';
import { buildErrorFromResponse } from './api-errors';
import { Page } from './common.dto';
import { SkillCategory } from './skill-category.dto';

export async function fetchSkillCategories(): Promise<Page<SkillCategory>> {
  const url = `${apiCoreUrl}/skill-categories?page=0&size=100`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}
