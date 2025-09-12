import { buildErrorFromResponse } from './api-errors';

export async function fetchRandomName(race: string): Promise<string> {
  // TODO: service map
  console.log('fetch race:', race);
  let requestRace = 'generic';
  if (race.includes('orc') || race.includes('troll')) {
    requestRace = 'orc';
  } else if (race.includes('elf')) {
    requestRace = 'sindar';
  }
  const url = `${process.env.RMU_API_NPC_NAMES_URL}/random-names/${requestRace}`;
  const response = await fetch(url, { method: 'GET' });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const json = await response.json();
  return json.name as string;
}
