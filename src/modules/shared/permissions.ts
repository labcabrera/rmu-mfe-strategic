import type { AuthContextProps } from 'react-oidc-context';
import {
  canWriteStrategic,
  gameAccessAtLeast,
  isAdmin,
  type Character,
  type StrategicGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';

export { isAdmin };

const userIdOf = (auth: AuthContextProps) => auth.user?.profile?.sub;

/** The owner of the game, or an admin: deletes it, changes its visibility and its masters (spec 071). */
export const isGameOwner = (auth: AuthContextProps, game: StrategicGame | undefined): boolean =>
  isAdmin(auth) || (!!game && (game.access === 'owner' || game.owner === userIdOf(auth)));

/** A game master: its owner, a master (spec 071), or an admin. */
export const isGameMaster = (auth: AuthContextProps, game: StrategicGame | undefined): boolean =>
  isGameOwner(auth, game) || (!!game && gameAccessAtLeast(game.access, 'master'));

/**
 * Who can change (and export) a character (spec 072): the masters and the players of its faction, as the `access` the
 * API sends says. The owner of a character no longer changes it by being its owner.
 */
export const canChangeCharacter = (
  auth: AuthContextProps,
  character: Character,
  game: StrategicGame | undefined
): boolean => isGameMaster(auth, game) || canWriteStrategic(character);
