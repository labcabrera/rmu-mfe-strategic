/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import {
  Character,
  Faction,
  fetchCharacter,
  fetchCharacters,
  fetchFaction,
  fetchStrategicItems,
  ItemHolder,
  ItemHolderKind,
  roundGold,
  StrategicItem,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';

/** Item type of the coins of a character (spec 023, decision 7). */
export const GOLD_COIN = 'gold-coin';

/** A character or a faction with its items and gold: what the market, the workshop and the inventories show. */
export type HolderView = {
  holder: ItemHolder;
  name: string;
  imageUrl?: string;
  gameId: string;
  /** The character, when the holder is one. */
  character?: Character;
  /** The faction itself, or the faction of the character. */
  faction?: Faction;
  items: StrategicItem[];
  /** Coins of a character, or the available gold of a faction. */
  gold: number;
  /** Characters of the faction: craftsmen, and who can receive an item. */
  members: Character[];
};

export const coinsOf = (items: StrategicItem[]): number =>
  roundGold(items.filter((item) => item.itemTypeId === GOLD_COIN).reduce((sum, item) => sum + (item.amount ?? 0), 0));

/** Items of a holder: a faction query also matches older items of its characters, so those are left out. */
export const fetchHolderItems = async (holder: ItemHolder, auth: ReturnType<typeof useAuth>) => {
  const field = holder.kind === 'character' ? 'characterId' : 'factionId';
  const page = await fetchStrategicItems(`${field}==${holder.id}`, 0, 1000, auth);
  return holder.kind === 'character' ? page.content : page.content.filter((item) => !item.characterId);
};

export const isHolderKind = (value: string | undefined): value is ItemHolderKind =>
  value === 'character' || value === 'faction';

export function useHolder(kind: string | undefined, id: string | undefined) {
  const auth = useAuth();
  const notify = useNotify();
  const [view, setView] = useState<HolderView>();
  const [error, setError] = useState<unknown>();

  const load = useCallback(async () => {
    if (!isHolderKind(kind) || !id) return;
    const holder: ItemHolder = { kind, id };
    try {
      if (kind === 'character') {
        const character = await fetchCharacter(id, auth);
        const [items, faction, members] = await Promise.all([
          fetchHolderItems(holder, auth),
          fetchFaction(character.faction.id, auth),
          fetchCharacters(`faction.id==${character.faction.id}`, 0, 100, auth).then((page) => page.content),
        ]);
        setView({
          holder,
          name: character.name,
          imageUrl: character.imageUrl ?? undefined,
          gameId: character.gameId,
          character,
          faction,
          items,
          gold: coinsOf(items),
          members,
        });
      } else {
        const faction = await fetchFaction(id, auth);
        const [items, members] = await Promise.all([
          fetchHolderItems(holder, auth),
          fetchCharacters(`faction.id==${id}`, 0, 100, auth).then((page) => page.content),
        ]);
        setView({
          holder,
          name: faction.name,
          imageUrl: faction.imageUrl ?? undefined,
          gameId: faction.gameId,
          faction,
          items,
          gold: faction.management.availableGold,
          members,
        });
      }
      setError(undefined);
    } catch (e) {
      setError(e);
      notify.error(e);
    }
  }, [kind, id]);

  useEffect(() => {
    load();
  }, [load]);

  return { view, error, refresh: load, invalid: !isHolderKind(kind) };
}

/** Path of the market or the workshop of a holder. */
export const holderPath = (page: 'market' | 'workshop', holder: ItemHolder, tab?: string) =>
  `/strategic/${page}/${holder.kind}/${holder.id}${tab ? `?tab=${tab}` : ''}`;

/** Path of the view of a holder. */
export const holderViewPath = (holder: ItemHolder) =>
  holder.kind === 'character' ? `/strategic/characters/view/${holder.id}` : `/strategic/factions/view/${holder.id}`;
