import type { AuthContextProps } from 'react-oidc-context';
import type { Character, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';

const ADMIN_GROUP = 'rmu-admin';

export const isAdmin = (auth: AuthContextProps): boolean =>
  ((auth.user?.profile?.groups as string[] | undefined) || []).includes(ADMIN_GROUP);

/** The game master: the owner of the game, or an admin. */
export const isGameMaster = (auth: AuthContextProps, game: StrategicGame | undefined): boolean =>
  isAdmin(auth) || (!!game && game.owner === auth.user?.profile?.sub);

/** Who can change (and export) a character: its owner or the game master. */
export const canChangeCharacter = (
  auth: AuthContextProps,
  character: Character,
  game: StrategicGame | undefined
): boolean => isGameMaster(auth, game) || (!!character.owner && character.owner === auth.user?.profile?.sub);
