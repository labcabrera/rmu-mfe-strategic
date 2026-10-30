import type { AuthContextProps } from 'react-oidc-context';
import { isAdmin, type Character, type StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';

export { isAdmin };

/** The game master: the owner of the game, or an admin. */
export const isGameMaster = (auth: AuthContextProps, game: StrategicGame | undefined): boolean =>
  isAdmin(auth) || (!!game && game.owner === auth.user?.profile?.sub);

/** Who can change (and export) a character: its owner or the game master. */
export const canChangeCharacter = (
  auth: AuthContextProps,
  character: Character,
  game: StrategicGame | undefined
): boolean => isGameMaster(auth, game) || (!!character.owner && character.owner === auth.user?.profile?.sub);
