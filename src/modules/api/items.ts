import { getAuthHeaders } from '../services/auth-token-service';
import { apiItemsUrl } from '../services/config';
import { buildErrorFromResponse } from './api-errors';

export interface Item {
  id: string;
  name: string;
  imageUrl?: string;
  itemTypeId: string;
  carried?: boolean;
  info?: ItemInfo;
  amount?: number;
  [key: string]: any;
}

export interface Equipment {
  weight: number;
  maneuverPenalty: number;
  baseManeuverPenalty: number;
  rangedPenalty: number;
  perceptionPenalty: number;
  movementBaseDifficulty: string;
}

export interface Armor {
  at?: string;
  bodyAt?: string;
  headAt?: string;
  armsAt?: string;
  legsAt?: string;
}

export interface ItemInfo {
  weightPercent: number;
  type?: string;
  weight?: number;
  length?: number;
  strength?: number;
  cost: any;
}

export async function fetchItems(rsql: string, page: number, size: number): Promise<Item[]> {
  const url = `${apiItemsUrl}/items?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const pageContent = await response.json();
  return pageContent.content as Item[];
}

export const weaponSubcategories = [
  'melee-weapon@blade',
  'melee-weapon@greater-blade',
  'melee-weapon@chain',
  'melee-weapon@hafted',
  'melee-weapon@greater-hafted',
  'melee-weapon@pole-arm',
  'melee-weapon@exotic',
  'ranged-weapon@bow',
  'ranged-weapon@crossbow',
];

export const categories = ['weapon', 'armor', 'shield', 'clothes', 'ammunition', 'tools', 'food'];

export const armorSubcategories = ['head', 'body', 'arms', 'legs'];
