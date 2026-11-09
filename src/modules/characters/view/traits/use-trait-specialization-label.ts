import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import {
  CharacterTrait,
  fetchSpellLists,
  SPELL_LIST_CATALOG_MAX,
  useSpecializationLabel,
  useSpellName,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';

/**
 * Label of the specialization of a trait: its translation or enumeration name, and for the talents taken for a spell
 * list (workspace spec 077, stored as the list code) the name of the list. The spell lists load only when a
 * specialization of the traits has no translation.
 */
export const useTraitSpecializationLabel = (traits: CharacterTrait[]): ((key: string | null | undefined) => string) => {
  const { i18n } = useTranslation();
  const auth = useAuth();
  const specializationLabel = useSpecializationLabel();
  const spellName = useSpellName();
  const untranslated = traits.some((trait) => !!trait.specialization && !i18n.exists(trait.specialization));

  // Names of the spell lists by code. Without them the codes are shown.
  const { data: lists } = useQuery({
    queryKey: ['spell-list-names'],
    queryFn: () =>
      fetchSpellLists('', 0, SPELL_LIST_CATALOG_MAX, auth).then(
        (page) =>
          new Map(page.content.filter((list) => !!list.code).map((list) => [list.code!, list.name ?? list.code!]))
      ),
    enabled: untranslated && !!auth?.isAuthenticated,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });

  return (key) => (key && !i18n.exists(key) && lists?.has(key) ? spellName(lists.get(key)!) : specializationLabel(key));
};
