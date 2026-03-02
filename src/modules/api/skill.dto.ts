export interface Skill {
  id: string;
  categoryId: string;
  bonus: string[];
  specialization: string | null;
}

export interface AddSkill {
  skillId: string;
  specialization: string | null;
  ranks: number;
}
