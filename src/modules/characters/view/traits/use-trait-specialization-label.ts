import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import {
  CharacterTrait,
  fetchSpellLists,
  SPELL_LIST_CATALOG_MAX,
  useSpecializationLabel,
} from '@labcabrera-rmu/rmu-react-shared-lib';

/** Names of the spell lists by code, loaded once per page. */
let spellListNames: Promise<Map<string, string>> | null = null;

const loadSpellListNames = (auth: ReturnType<typeof useAuth>): Promise<Map<string, string>> => {
  if (!spellListNames) {
    spellListNames = fetchSpellLists('', 0, SPELL_LIST_CATALOG_MAX, auth)
      .then(
        (page) =>
          new Map(page.content.filter((list) => !!list.code).map((list) => [list.code!, list.name ?? list.code!]))
      )
      .catch(() => {
        // Without names the codes are shown; a later page load tries again
        spellListNames = null;
        return new Map<string, string>();
      });
  }
  return spellListNames;
};

/**
 * Label of the specialization of a trait: its translation or enumeration name, and for the talents taken for a spell
 * list (workspace spec 077, stored as the list code) the name of the list. The spell lists load only when a
 * specialization of the traits has no translation.
 */
export const useTraitSpecializationLabel = (traits: CharacterTrait[]): ((key: string | null | undefined) => string) => {
  const { i18n } = useTranslation();
  const auth = useAuth();
  const specializationLabel = useSpecializationLabel();
  const [lists, setLists] = useState<Map<string, string>>(new Map());
  const untranslated = traits.some((trait) => !!trait.specialization && !i18n.exists(trait.specialization));

  useEffect(() => {
    if (!untranslated || !auth?.isAuthenticated) return;
    let active = true;
    loadSpellListNames(auth).then((names) => active && setLists(names));
    return () => {
      active = false;
    };
  }, [untranslated, auth?.isAuthenticated]);

  return (key) => (key && !i18n.exists(key) && lists.has(key) ? lists.get(key)! : specializationLabel(key));
};
