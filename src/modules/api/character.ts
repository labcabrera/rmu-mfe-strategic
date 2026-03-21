import { getAuthHeaders, mergeJsonHeaders } from '../services/auth-token-service';
import { apiStrategicGameUrl } from './../services/config';
import { buildErrorFromResponse } from './api-errors';
import { AddItemDto, AddTraitDto, Character, CharacterTrait } from './character.dto';
import { AddSkill } from './skill.dto';

export async function fetchCharacter(characterId: string): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchCharacters(rsql: string, page: number, size: number): Promise<Character[]> {
  const url = `${apiStrategicGameUrl}/characters?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const pageContent = await response.json();
  return pageContent.content as Character[];
}

export async function createCharacter(characterData: Partial<Character>): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters`;
  const response = await fetch(url, {
    method: 'POST',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(characterData),
  });
  if (response.status !== 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function updateCharacter(characterId: string, character: Partial<Character>): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(character),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteCharacter(characterId: string): Promise<void> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}`;
  const response = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() });
  if (response.status !== 204) {
    throw await buildErrorFromResponse(response, url);
  }
}

export async function addSkill(characterId: string, data: AddSkill): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/skills`;
  const response = await fetch(url, {
    method: 'POST',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(data),
  });
  if (response.status !== 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteSkill(
  characterId: string,
  skillId: string,
  specialization: string | undefined
): Promise<any> {
  const specializationQuery = specialization ? `?specialization=${specialization}` : '';
  const url = `${apiStrategicGameUrl}/characters/${characterId}/skills/${skillId}${specializationQuery}`;
  const response = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function levelUpSkill(
  characterId: string,
  skillId: string,
  specialization: string | undefined
): Promise<Character> {
  const specializationQuery = specialization ? `?specialization=${specialization}` : '';
  const url = `${apiStrategicGameUrl}/characters/${characterId}/skills/${skillId}/level-up${specializationQuery}`;
  const response = await fetch(url, { method: 'PATCH', headers: mergeJsonHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function levelDownSkill(
  characterId: string,
  skillId: string,
  specialization: string | undefined
): Promise<any> {
  const specializationQuery = specialization ? `?specialization=${specialization}` : '';
  const url = `${apiStrategicGameUrl}/characters/${characterId}/skills/${skillId}/level-down${specializationQuery}`;
  const response = await fetch(url, { method: 'PATCH', headers: mergeJsonHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function setUpProfessionalSkill(
  characterId: string,
  skillId: string,
  specialization: string | undefined,
  types: string[]
): Promise<any> {
  const specializationQuery = specialization ? `?specialization=${specialization}` : '';
  const url = `${apiStrategicGameUrl}/characters/${characterId}/skills/${skillId}/professional${specializationQuery}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: mergeJsonHeaders(),
    body: JSON.stringify({ types: types }),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function addItem(characterId: string, data: AddItemDto): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/items`;
  const response = await fetch(url, {
    method: 'POST',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(data),
  });
  if (response.status !== 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteItem(characterId: string, itemId: string): Promise<any> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/items/${itemId}`;
  const response = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function equipItem(characterId: string, slot: string, itemId: string): Promise<any> {
  const request = { slot: slot, itemId: itemId };
  const url = `${apiStrategicGameUrl}/characters/${characterId}/equipment`;
  const response = await fetch(url, {
    method: 'POST',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(request),
  });
  if (response.status !== 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function unequipItem(characterId: string, slot: string): Promise<any> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/equipment/${slot}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: mergeJsonHeaders(),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function updateCarriedStatus(characterId: string, itemId: string, carried: boolean): Promise<any> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/items/${itemId}/carried/${carried}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: mergeJsonHeaders(),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function transferFactionGold(characterId: string, amount: number): Promise<any> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/transfer-faction-gold`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: mergeJsonHeaders(),
    body: JSON.stringify({ amount }),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function levelUpCharacter(characterId: string, force: boolean): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/level-up?force=${force}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: mergeJsonHeaders(),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function addCharacterXP(characterId: string, xp: number): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/xp`;
  const response = await fetch(url, {
    method: 'POST',
    headers: mergeJsonHeaders(),
    body: JSON.stringify({ xp }),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function addTrait(characterId: string, addTraitDto: AddTraitDto): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/traits`;
  const response = await fetch(url, {
    method: 'POST',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(addTraitDto),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteTrait(characterId: string, characterTrait: CharacterTrait): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/traits`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: mergeJsonHeaders(),
    body: JSON.stringify({ traitId: characterTrait.traitId, tier: characterTrait.specialization }),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}
