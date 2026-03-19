import { getAuthHeaders, mergeJsonHeaders } from '../services/auth-token-service';
import { apiCoreUrl } from '../services/config';
import { buildErrorFromResponse } from './api-errors';
import { Page } from './common.dto';
import { CreateEnumerationDto, Enumeration, UpdateEnumerationDto } from './enumerations.dto';

export async function fetchEnumerationCategories(): Promise<string[]> {
  const url = `${apiCoreUrl}/enumeration-categories`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchEnumeration(id: string): Promise<Enumeration> {
  const url = `${apiCoreUrl}/enumerations/${id}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchEnumerations(rsql: string, page: number, size: number): Promise<Page<Enumeration>> {
  const url = `${apiCoreUrl}/enumerations?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const pageContent = await response.json();
  return pageContent;
}

export async function createEnumeration(dto: CreateEnumerationDto): Promise<Enumeration> {
  const url = `${apiCoreUrl}/enumerations`;
  const response = await fetch(url, {
    method: 'POST',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(dto),
  });
  if (response.status !== 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function updateEnumeration(id: string, dto: UpdateEnumerationDto): Promise<Enumeration> {
  const url = `${apiCoreUrl}/enumerations/${id}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(dto),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteEnumeration(id: string): Promise<void> {
  const url = `${apiCoreUrl}/enumerations/${id}`;
  const response = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() });
  if (response.status !== 204) {
    throw await buildErrorFromResponse(response, url);
  }
}
