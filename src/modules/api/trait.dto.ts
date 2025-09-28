export interface Trait {
  id: string;
  name: string;
  category: string;
  isTalent: boolean;
  requiresSpecialization: boolean;
  isTierBased: true;
  maxTier: number;
  adquisitionCost: number;
  tierCost: number | undefined;
  description: string;
}
