export const stats = ['ag', 'co', 'em', 'in', 'me', 'pr', 'qu', 're', 'sd', 'st'];

export interface Character {
  id: string;
  gameId: string;
  factionId: string;
  name: string;
  info: CharacterInfo;
  roleplay: CharacterRoleplay;
  experience: CharacterExperience;
  statistics: CharacterStatistics;
  resistances: CharacterResistance[];
  skills: CharacterSkill[];
  items: CharacterItem[];
  equipment: CharacterEquipment;
  traits: CharacterTrait[];
  [key: string]: any;
}

export interface CreateCharacterDto extends Omit<Character, 'items'> {}

export interface AddTraitDto {
  traitId: string;
  tier: number | undefined;
  specialization: string | undefined;
}

export interface UpdateCharacterDto {
  name: string | undefined;
  description: string | undefined;
  info:
    | {
        weight: number | undefined;
        height: number | undefined;
      }
    | undefined;
  roleplay:
    | {
        gender: string | undefined;
        age: number | undefined;
      }
    | undefined;
}

export interface CharacterInfo {
  raceId: string;
  raceName: string;
  professionId: string;
  sizeId: string;
  realmType: string;
  height: number;
  weight: number;
}

export interface CharacterRoleplay {
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

export interface CharacterTrait {
  traitId: string;
  traitName: string;
  isTalent: boolean;
  tier: number | undefined;
  cost: number;
  specialization: string | undefined;
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
  mainHand: string | undefined;
  offHand: string | undefined;
  body: string | undefined;
  head: string | undefined;
  arms: string | undefined;
  legs: string | undefined;
  weight: number | undefined;
  weightAllowance: number | undefined;
  encumbrancePenalty?: number;
  baseManeuverPenalty: number | undefined;
  maneuverPenalty?: number;
  rangedPenalty?: number;
  perceptionPenalty?: number;
  movementBaseDifficulty?: string | undefined;
}

export interface CharacterItem {
  id: string;
  name: string;
  itemTypeId: string;
  category?: string;
  weapon?: WeaponInfo;
  armor?: ArmorInfo;
  info: any;
  amount?: number;
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
  bonus: number;
  racial: number | undefined;
  custom: number;
  totalBonus: number;
}

export type CharacterStatistics = {
  [key in (typeof stats)[number]]: Stat;
};

export interface CharacterResistance {
  resistance: string;
  statBonus: number;
  racialBonus: number;
  realmBonus: number;
  customBonus: number;
  totalBonus: number;
}

export interface CharacterExperience {
  level: number;
  availableLevel: number;
  xp: number;
  developmentPoints: number;
  availableDevelopmentPoints: number;
  weaponDevelopment: string[];
}

export interface AddItemDto {
  name: string;
  itemTypeId: string;
  amount?: number;
  weight?: number;
  weightPercent?: number;
  strength?: number;
  cost?: number;
}
