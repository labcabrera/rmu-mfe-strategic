import type { AuthContextProps } from 'react-oidc-context';
import {
  gameAccessAtLeast,
  isAdmin,
  type Character,
  type Faction,
  type StrategicGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';

export { isAdmin };

const userIdOf = (auth: AuthContextProps) => auth.user?.profile?.sub;

/** The owner of the game, or an admin: deletes it, changes its visibility and its co-masters (spec 071). */
export const isGameOwner = (auth: AuthContextProps, game: StrategicGame | undefined): boolean =>
  isAdmin(auth) || (!!game && (game.access === 'owner' || game.owner === userIdOf(auth)));

/** A game master: its owner, a co-master (spec 071), or an admin. */
export const isGameMaster = (auth: AuthContextProps, game: StrategicGame | undefined): boolean =>
  isGameOwner(auth, game) || (!!game && gameAccessAtLeast(game.access, 'master'));

/** A player of the game or more: creates characters in it (spec 071). */
export const isGamePlayer = (auth: AuthContextProps, game: StrategicGame | undefined): boolean =>
  isGameMaster(auth, game) || (!!game && gameAccessAtLeast(game.access, 'player'));

/** The leader of the faction (spec 071): spends its gold and buys for it. */
export const isFactionLeader = (auth: AuthContextProps, faction: Faction | undefined): boolean =>
  !!faction?.leaderId && faction.leaderId === userIdOf(auth);

/** Who can change (and export) a character: the game masters, or its owner while a player of the game (spec 071). */
export const canChangeCharacter = (
  auth: AuthContextProps,
  character: Character,
  game: StrategicGame | undefined
): boolean =>
  isGameMaster(auth, game) ||
  (!!character.owner && character.owner === userIdOf(auth) && (!game || isGamePlayer(auth, game)));
