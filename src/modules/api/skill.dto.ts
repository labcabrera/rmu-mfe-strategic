export interface Skill {
  id: string;
  categoryId: string;
  bonus: string[];
  specializations: string[];
}

export interface AddSkill {
  skillId: string;
  specialization: string | null;
  ranks: number;
}
