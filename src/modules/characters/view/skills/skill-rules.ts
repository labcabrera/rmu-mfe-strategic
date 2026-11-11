import { Character, Profession, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { MAX_PROFESSIONAL_SKILLS, resolvePowerLevel } from '../../../services/game-rules';

export interface PendingProfessionalBonuses {
  /** Professional bonuses still to assign. */
  professional: number;
  /** Knacks still to assign, from the power level of the game. */
  knacks: number;
  /** The character does not have enough skills of its profession to mark the pending professional bonuses. */
  needsMoreSkills: boolean;
}

/** What the character still has to mark in the skill table: professional bonuses and knacks. */
export const pendingProfessionalBonuses = (
  character: Character,
  profession: Profession,
  game?: StrategicGame
): PendingProfessionalBonuses => {
  const count = (type: string) => character.skills.filter((skill) => skill.professional?.includes(type)).length;
  const professional = Math.max(0, MAX_PROFESSIONAL_SKILLS - count('professional'));
  const knacks = Math.max(0, resolvePowerLevel(game?.powerLevel).knackCount - count('knack'));
  // Only the skills of the profession that the character has can be marked
  const candidates = character.skills.filter((skill) =>
    (profession.professionalSkills as string[]).includes(skill.skillId)
  ).length;
  return { professional, knacks, needsMoreSkills: professional > 0 && candidates < MAX_PROFESSIONAL_SKILLS };
};
