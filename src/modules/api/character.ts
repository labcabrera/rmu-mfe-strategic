import { buildErrorFromResponse } from './api-errors';
import { AddItemDto, Character } from './character.dto';
import { Item } from './items';
import { AddSkill } from './skill.dto';

export async function fetchCharacter(characterId: string): Promise<Character> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchCharacters(rsql: string, page: number, size: number): Promise<Character[]> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const pageContent = await response.json();
  return pageContent.content as Character[];
}

export async function createCharacter(characterData: Partial<Character>): Promise<Character> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(characterData),
  });
  if (response.status !== 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function updateCharacter(characterId: string, character: Partial<Character>): Promise<Character> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(character),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteCharacter(characterId: string): Promise<void> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.status !== 204) {
    throw await buildErrorFromResponse(response, url);
  }
}

export async function addSkill(characterId: string, data: AddSkill): Promise<Character> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/skills`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (response.status !== 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteSkill(characterId: string, skillId: string): Promise<any> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/skills/${skillId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function levelUpSkill(characterId: string, skillId: string): Promise<any> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/skills/${skillId}/level-up`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function levelDownSkill(characterId: string, skillId: string): Promise<any> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/skills/${skillId}/level-down`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function setUpProfessionalSkill(characterId: string, skillId: string): Promise<any> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/skills/${skillId}/professional`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function addItem(characterId: string, data: AddItemDto): Promise<Character> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/items`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (response.status !== 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteItem(characterId: string, itemId: string): Promise<any> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/items/${itemId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function equipItem(characterId: string, slot: string, itemId: string): Promise<any> {
  const request = { slot: slot, itemId: itemId };
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/equipment`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (response.status !== 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function unequipItem(characterId: string, slot: string): Promise<any> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/equipment/${slot}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function updateCarriedStatus(characterId: string, itemId: string, carried: boolean): Promise<any> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/items/${itemId}/carried/${carried}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function transferFactionGold(characterId: string, amount: number): Promise<any> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/transfer-faction-gold`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function levelUpCharacter(characterId: string, force: boolean): Promise<Character> {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/level-up?force=${force}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}
