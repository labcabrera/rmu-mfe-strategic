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
  maneuverPenalty: number;
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
  rarity?: 'common' | 'uncommon' | 'rare' | 'very-rare';
  unique?: boolean;
}

export interface ItemCost {
  min: number;
  average: number;
  max: number;
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
