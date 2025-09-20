export interface Faction {
  id: string;
  gameId: string;
  name: string;
  availableGold: number | undefined;
  availableXP: number | undefined;
  description?: string;
}

export interface CreateFactionDto extends Omit<Faction, 'id'> {}

export interface UpdateFactionDto extends Partial<Omit<Faction, 'id'>> {}
