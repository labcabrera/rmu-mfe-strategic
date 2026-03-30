import { getAuthHeaders } from '../services/auth-token-service';
import { apiItemsUrl } from '../services/config';
import { buildErrorFromResponse } from './api-errors';
import { NamedEntity } from './common.dto';

export interface Item {
  id: string;
  realm: NamedEntity;
  category: string;
  armor?: ItemArmor;
  weapon?: ItemWeapon;
  info: ItemInfo;
  imageUrl?: string;
}

export interface ItemArmor {
  slot: string;
  at: number;
  enc: number;
  maneuver: number;
  rangedPenalty: number;
  perceptionPenalty: number;
  baseDifficulty: string;
}

export interface ItemWeapon {
  skillId: string;
  fumble: number;
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
  cost?: ItemCost;
  length?: number;
  weight?: number;
  weightPercent?: number;
  strength?: number;
  productionHours?: number;
}

export interface ItemCost {
  min: number;
  average: number;
  max: number;
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
