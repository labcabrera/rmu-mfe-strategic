/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { AuthContextProps, useAuth } from 'react-oidc-context';
import { apiCoreUrl, callApi, HealingType } from '@labcabrera-rmu/rmu-react-shared-lib';

/**
 * Part of the healing tables of rmu-api-core (`GET /v1/healing-tables`) used for the previews of the Health section.
 * The strategic API does the real computations; the values are rulebook content and are never written here.
 */
export interface HealingTables {
  healingTypeModifiers: Record<HealingType, number>;
  herbalismBonus: number;
  restHpPercentPerPeriod: number;
  restPeriodHours: number;
  fullRestDayMultiplier: number;
  talentMultipliers?: Record<string, number>;
}

export async function fetchHealingTables(auth: AuthContextProps): Promise<HealingTables> {
  return callApi(auth, `${apiCoreUrl}/healing-tables`, { method: 'GET' });
}

let cache: Promise<HealingTables | undefined> | undefined;

/**
 * Healing tables for the previews, loaded once. Undefined while loading or when they are not available (no Core Law
 * access, not imported): the previews then leave out the values they cannot compute.
 */
export const useHealingTables = (): HealingTables | undefined => {
  const auth = useAuth();
  const [tables, setTables] = useState<HealingTables>();
  useEffect(() => {
    if (!cache) {
      cache = fetchHealingTables(auth).catch(() => {
        cache = undefined;
        return undefined;
      });
    }
    let active = true;
    cache.then((value) => active && setTables(value));
    return () => {
      active = false;
    };
  }, []);
  return tables;
};
