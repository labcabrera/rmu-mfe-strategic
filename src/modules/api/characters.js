export async function fetchCharacter(characterId) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}

export async function fetchCharacters(rsql, page, size) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  const pageContent = await response.json();
  return pageContent.content;
}

export async function createCharacter(characterData) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(characterData),
  });
  if (response.status != 201) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}

export async function updateCharacter(characterId, character) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(character),
  });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}

export async function deleteCharacter(characterId) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.status != 204) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
}

export async function addSkill(characterId, data) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/skills`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (response.status != 201) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}

export async function deleteSkill(characterId, skillId) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/skills/${skillId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}

export async function levelUpSkill(characterId, skillId) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/skills/${skillId}/level-up`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}

export async function levelDownSkill(characterId, skillId) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/skills/${skillId}/level-down`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}

export async function setUpProfessionalSkill(characterId, skillId) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/skills/${skillId}/professional`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}

export async function addItem(characterId, data) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/items`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (response.status != 201) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}

export async function deleteItem(characterId, itemId) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/items/${itemId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}

export async function equipItem(characterId, slot, itemId) {
  const request = { slot: slot, itemId: itemId };
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/equipment`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (response.status != 201) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}

export async function unequipItem(characterId, slot) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/equipment/${slot}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}

export async function updateCarriedStatus(characterId, itemId, carried) {
  const url = `${process.env.RMU_API_STRATEGIC_URL}/characters/${characterId}/items/${itemId}/carried/${carried}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}

//TODO move
export async function fetchCharacterSizes() {
  const url = `${process.env.RMU_API_CORE_URL}/character-sizes`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status != 200) {
    throw new Error(`Error: ${response.status} ${response.statusText}. (${url})`);
  }
  return await response.json();
}
