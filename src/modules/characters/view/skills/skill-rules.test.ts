import { Character, Profession, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { describe, expect, it } from 'vitest';
import { pendingProfessionalBonuses } from './skill-rules';

const profession = { professionalSkills: ['a', 'b', 'c'] } as unknown as Profession;
const game = (knackCount: number) => ({ powerLevel: { knackCount } }) as unknown as StrategicGame;
const character = (skills: object[]) => ({ skills }) as unknown as Character;

describe('pendingProfessionalBonuses', () => {
  it('counts what is still to mark', () => {
    const skills = [
      { skillId: 'a', professional: ['professional'] },
      { skillId: 'b', professional: ['knack'] },
    ];
    const pending = pendingProfessionalBonuses(character(skills), profession, game(2));
    expect(pending.professional).toBe(9);
    expect(pending.knacks).toBe(1);
  });

  it('never goes below zero', () => {
    const marked = Array.from({ length: 12 }, () => ({ skillId: 'a', professional: ['professional', 'knack'] }));
    expect(pendingProfessionalBonuses(character(marked), profession, game(2))).toEqual({
      professional: 0,
      knacks: 0,
      needsMoreSkills: false,
    });
  });

  it('warns only when the skills of the profession are not enough', () => {
    expect(pendingProfessionalBonuses(character([{ skillId: 'a' }]), profession, game(2)).needsMoreSkills).toBe(true);
    const many = Array.from({ length: 10 }, () => ({ skillId: 'b' }));
    expect(pendingProfessionalBonuses(character(many), profession, game(2)).needsMoreSkills).toBe(false);
  });
});
