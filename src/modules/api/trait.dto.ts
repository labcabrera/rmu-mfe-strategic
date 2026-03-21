export const traitCategories = ['combat', 'discipline', 'magical', 'physical', 'racial', 'senses', 'other'];

export interface Trait {
  id: string;
  name: string;
  category: string;
  isTalent: boolean;
  requiresSpecialization: boolean;
  specialization: string | null;
  isTierBased: true;
  maxTier: number;
  adquisitionCost: number;
  tierCost: number | undefined;
  description: string;
}
