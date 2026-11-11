import { useTranslation } from 'react-i18next';
import { Trait } from '@labcabrera-rmu/rmu-react-shared-lib';
import { toRoman } from '../../../services/roman-number-service';
import { TraitBlockReason } from './trait-rules';

export const useTraitName = () => {
  const { t } = useTranslation();
  return (trait: Trait) => t(trait.id, { defaultValue: trait.name });
};

export const useReasonText = () => {
  const { t } = useTranslation();
  return (reason: TraitBlockReason) => {
    const params = { ...reason.params };
    if (typeof params.tier === 'number') params.tier = toRoman(params.tier);
    return t(reason.key, params);
  };
};
