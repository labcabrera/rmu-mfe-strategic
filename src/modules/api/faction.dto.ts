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
