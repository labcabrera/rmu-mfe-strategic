export interface Faction {
  id: string;
  gameId: string;
  name: string;
  management: FactionManagement;
  shortDescription?: string;
  description?: string;
  imageUrl?: string;
  owner?: string;
}

export interface FactionManagement {
  availableGold: number;
  availableXP: number;
}

export interface CreateFactionDto extends Omit<Faction, 'id'> {}

export interface UpdateFactionDto extends Partial<Omit<Faction, 'id'>> {}

export const EMPTY_FACTION: CreateFactionDto = {
  gameId: null,
  name: null,
  management: {
    availableGold: 100,
    availableXP: 200000,
  },
  shortDescription: '',
  description: '',
};
