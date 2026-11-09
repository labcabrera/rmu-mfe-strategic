/* eslint-disable react-hooks/exhaustive-deps */
import { useAuth } from 'react-oidc-context';
import { fetchHealingTables, HealingTables } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';

/**
 * Healing tables for the previews, loaded once. Undefined while loading or when they are not available (no Core Law
 * access, not imported): the previews then leave out the values they cannot compute.
 */
export const useHealingTables = (): HealingTables | undefined => {
  const auth = useAuth();
  const { data } = useQuery({
    queryKey: ['healing-tables'],
    queryFn: () => fetchHealingTables(auth),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });
  return data;
};
