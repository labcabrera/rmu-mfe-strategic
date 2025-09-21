export interface StrategicGame {
  id: string;
  name: string;
  realmId: string;
  realmName: string;
  status: string;
  options: StrategicGameOptions;
  powerLevel: StrategicGamePowerLevel;
  description?: string;
  imageUrl?: string;
  owner: string;
}

export interface StrategicGameOptions {
  experienceMultiplier: number;
  fatigueMultiplier: number;
  boardScaleMultiplier: number;
  letality: number;
}

export interface StrategicGamePowerLevel {
  baseDevPoints: number;
  statRandomMin: number;
  statBoostPotential: number;
  statBoostTemporary: number;
  statCreationBoost: number;
  statCreationSwap: number;
}

export interface CreateStrategicGameDto extends Omit<StrategicGame, 'id' | 'realmName' | 'status' | 'owner'> {}

export interface UpdateStrategicGameDto
  extends Partial<Omit<StrategicGame, 'id' | 'realmId' | 'realmName' | 'status' | 'owner'>> {}

export const gameCreateTemplate = {
  name: '',
  realmId: '',
  options: {
    experienceMultiplier: 1,
    fatigueMultiplier: 1,
    boardScaleMultiplier: 1,
    letality: 0,
  },
  powerLevel: {
    baseDevPoints: 60,
    statRandomMin: 11,
    statBoostPotential: 78,
    statBoostTemporary: 56,
    statCreationBoost: 2,
    statCreationSwap: 2,
  },
  description: '',
} as CreateStrategicGameDto;
