export interface Character {
  id: string;
  name: string;
  raceId: string;
  sizeId: string;
  resistances: CharacterResistance[];
  skills: CharacterSkill[];
  items: CharacterItem[];
  equipment: CharacterEquipment;
  [key: string]: any;
}

export interface Roleplay {
  gender: string;
  age: number;
}

export interface RaceInfo {
  raceId: string;
  raceName?: string;
  professionId: string;
  realmType: string;
  height: number;
  weight: number;
}

export interface CharacterSkill {
  id: string;
  skillId: string;
  specialization?: string;
  development: number[];
  category?: string;
  statistics: string[];
  ranks: number;
  ranksDeveloped: number;
  statBonus: number;
  racialBonus: number;
  professionalBonus: number;
  developmentBonus: number;
  customBonus: number;
  totalBonus: number;
  professional?: string[];
}

export interface CharacterEquipment {
  mainHand?: string;
  offHand?: string;
  body?: string;
  head?: string;
  arms?: string;
  legs?: string;
  [key: string]: string | undefined;
}

export interface CharacterItem {
  id: string;
  name: string;
  itemTypeId: string;
  category?: string;
  weapon?: WeaponInfo;
  armor?: ArmorInfo;
}

export interface WeaponInfo {
  fumble: string;
  sizeAdjustment: string;
  requiredHands: number;
}

export interface ArmorInfo {
  slot: string;
}

export interface Stat {
  potential: number;
  temporary: number;
  racial: number | undefined;
}

export type Statistics = Record<string, Stat>;

export interface CharacterResistance {
  resistance: string;
  statBonus: number;
  racialBonus: number;
  realmBonus: number;
  customBonus: number;
  totalBonus: number;
}

export interface CreateCharacterDto {
  gameId: string;
  factionId: string;
  info: RaceInfo;
  statistics: Statistics;
  name: string;
  description: string;
  roleplay: Roleplay;
  level: number;
  weaponDevelopment: string[];
  [key: string]: any;
}
