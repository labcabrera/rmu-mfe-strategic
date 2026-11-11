/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import {
  Character,
  Faction,
  fetchCharacter,
  fetchCharacters,
  fetchFaction,
  fetchFullPage,
  fetchStrategicItems,
  ItemHolder,
  ItemHolderKind,
  roundGold,
  StrategicItem,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

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

const coinsOf = (items: StrategicItem[]): number =>
  roundGold(items.filter((item) => item.itemTypeId === GOLD_COIN).reduce((sum, item) => sum + (item.amount ?? 0), 0));

/** Items of a holder: a faction query also matches older items of its characters, so those are left out. */
const fetchHolderItems = async (holder: ItemHolder, auth: ReturnType<typeof useAuth>) => {
  const field = holder.kind === 'character' ? 'characterId' : 'factionId';
  const page = await fetchStrategicItems(`${field}==${holder.id}`, 0, 1000, auth);
  return holder.kind === 'character' ? page.content : page.content.filter((item) => !item.characterId);
};

const isHolderKind = (value: string | undefined): value is ItemHolderKind =>
  value === 'character' || value === 'faction';

const fetchHolderView = async (holder: ItemHolder, auth: ReturnType<typeof useAuth>): Promise<HolderView> => {
  const { kind, id } = holder;
  if (kind === 'character') {
    const character = await fetchCharacter(id, auth);
    const [items, faction, members] = await Promise.all([
      fetchHolderItems(holder, auth),
      fetchFaction(character.faction.id, auth),
      fetchFullPage(
        (rsql, page, size) => fetchCharacters(rsql, page, size, auth),
        `faction.id==${character.faction.id}`
      ).then((page) => page.content),
    ]);
    return {
      holder,
      name: character.name,
      imageUrl: character.imageUrl ?? undefined,
      gameId: character.gameId,
      character,
      faction,
      items,
      gold: coinsOf(items),
      members,
    };
  }
  const faction = await fetchFaction(id, auth);
  const [items, members] = await Promise.all([
    fetchHolderItems(holder, auth),
    fetchFullPage((rsql, page, size) => fetchCharacters(rsql, page, size, auth), `faction.id==${id}`).then(
      (page) => page.content
    ),
  ]);
  return {
    holder,
    name: faction.name,
    imageUrl: faction.imageUrl ?? undefined,
    gameId: faction.gameId,
    faction,
    items,
    gold: faction.management.availableGold,
    members,
  };
};

export function useHolder(kind: string | undefined, id: string | undefined) {
  const auth = useAuth();
  const notify = useApiNotify();
  const enabled = isHolderKind(kind) && !!id;
  const query = useQuery({
    queryKey: ['holder', kind, id],
    queryFn: () => fetchHolderView({ kind: kind as ItemHolderKind, id: id as string }, auth),
    enabled,
    gcTime: 0,
    placeholderData: keepPreviousData,
    // Other components reload when `view` changes (`refreshKey={view}`): every load has to be a new object
    structuralSharing: false,
  });
  const { refetch } = query;

  useEffect(() => {
    if (query.error) notify.error(query.error);
  }, [query.error]);

  const refresh = useCallback(async () => {
    if (enabled) await refetch();
  }, [enabled, refetch]);

  return { view: query.data, error: query.error ?? undefined, refresh, invalid: !isHolderKind(kind) };
}

/** Pages of the items and gold of a holder: buy and sell, craft and repair, and enchant (spec 064). */
export type EconomyPage = 'market' | 'workshop' | 'enchantments';
export const ECONOMY_PAGES: EconomyPage[] = ['market', 'workshop', 'enchantments'];

/** Path of the market, the workshop or the enchantments of a holder. */
export const holderPath = (page: EconomyPage, holder: ItemHolder, tab?: string) =>
  `/strategic/${page}/${holder.kind}/${holder.id}${tab ? `?tab=${tab}` : ''}`;

/** Path of the view of a holder. */
export const holderViewPath = (holder: ItemHolder) =>
  holder.kind === 'character' ? `/strategic/characters/view/${holder.id}` : `/strategic/factions/view/${holder.id}`;
