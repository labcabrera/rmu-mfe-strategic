import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import {
  Alert,
  Box,
  Chip,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CharacterTrait,
  ChipRow,
  SectionLabel,
  Trait,
  TraitAcquisitionType,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { toRoman } from '../../../services/roman-number-service';
import { MASTER_PREREQUISITES, prerequisiteValues, TierAcquisition } from './trait-rules';

/** Prerequisite chosen in the dialog: the automatic ones, or one the game master grants. */
export type PrerequisiteChoice = 'auto' | TraitAcquisitionType;

/** Key of a talent of the character in the link selector. */
export const traitKey = (trait: { traitId: string; specialization?: string | null }) =>
  `${trait.traitId}|${trait.specialization ?? ''}`;

/** Flaws whose hindrance the API checks itself: the others wait for the game master (spec 077, question 10). */
const CHECKED_FLAWS = ['inept', 'mumbler', 'inglorious-failure', 'lack-of-scope', 'lack-of-time'];

/**
 * Spec 077 (C11, C12, C14) in the purchase dialog: the Possible Flaws of a talent by name, the prerequisite each new
 * tier meets (and the one the game master grants), the talent a flaw is linked to and the restricted switch.
 */
const TraitPurchaseRules: FC<{
  trait: Trait;
  catalog: Map<string, Trait>;
  current?: CharacterTrait;
  rulesOn: boolean;
  gameMaster: boolean;
  acquisitions: TierAcquisition[];
  chosen: PrerequisiteChoice;
  setChosen: (value: PrerequisiteChoice) => void;
  prerequisiteNote: string;
  setPrerequisiteNote: (value: string) => void;
  linkable: CharacterTrait[];
  linkKey: string;
  setLinkKey: (value: string) => void;
  restricted: boolean;
  setRestricted: (value: boolean) => void;
  restrictedNote: string;
  setRestrictedNote: (value: string) => void;
}> = ({
  trait,
  catalog,
  current,
  rulesOn,
  gameMaster,
  acquisitions,
  chosen,
  setChosen,
  prerequisiteNote,
  setPrerequisiteNote,
  linkable,
  linkKey,
  setLinkKey,
  restricted,
  setRestricted,
  restrictedNote,
  setRestrictedNote,
}) => {
  const { t } = useTranslation();
  const traitName = (id: string) => t(id, { defaultValue: catalog.get(id)?.name ?? id });
  const ownedName = (owned: CharacterTrait) =>
    [t(owned.traitId, { defaultValue: owned.traitName }), owned.tier ? toRoman(owned.tier) : '', owned.specialization]
      .filter(Boolean)
      .join(' ');
  const prerequisites = trait.prerequisites ?? [];
  const masterTypes = MASTER_PREREQUISITES.filter((type) => prerequisites.some((entry) => entry.type === type));
  const metTypes = new Set(acquisitions.map((entry) => entry.type).filter(Boolean));
  const unmet = acquisitions.some((entry) => !entry.type);
  const prerequisiteLabel = (prerequisite: { type: TraitAcquisitionType; value?: unknown }) =>
    [
      t(`trait-prerequisite-${prerequisite.type}`),
      prerequisiteValues(prerequisite.value)
        .map((value) => t(value, { defaultValue: value }))
        .join(', '),
    ]
      .filter(Boolean)
      .join(': ');
  const currentLink = current?.linkedTo;
  const pendingApprovalExpected =
    rulesOn && !trait.isTalent && !current && !gameMaster && !CHECKED_FLAWS.includes(trait.id);

  return (
    <Stack spacing={2}>
      {trait.isTalent && !!trait.possibleFlaws?.length && (
        <Box>
          <SectionLabel>{t('trait-possible-flaws')}</SectionLabel>
          <ChipRow>
            {trait.possibleFlaws.map((flawId) => (
              <Chip key={flawId} size="small" variant="outlined" label={traitName(flawId)} />
            ))}
          </ChipRow>
        </Box>
      )}

      {rulesOn && trait.isTalent && prerequisites.length > 0 && (
        <Box>
          <SectionLabel>{t('trait-prerequisites')}</SectionLabel>
          <ChipRow>
            {prerequisites.map((prerequisite, index) => {
              const met = metTypes.has(prerequisite.type);
              const chip = (
                <Chip
                  size="small"
                  color={met ? 'success' : 'default'}
                  variant={met ? 'filled' : 'outlined'}
                  icon={met ? <CheckCircleOutlineIcon /> : undefined}
                  label={prerequisiteLabel(prerequisite)}
                />
              );
              const help = [
                prerequisite.description,
                MASTER_PREREQUISITES.includes(prerequisite.type) ? t('trait-prerequisite-master-only') : '',
              ]
                .filter(Boolean)
                .join(' · ');
              return help ? (
                <Tooltip key={index} title={help}>
                  {chip}
                </Tooltip>
              ) : (
                <React.Fragment key={index}>{chip}</React.Fragment>
              );
            })}
          </ChipRow>
          {acquisitions.length > 0 && (
            <Stack spacing={0.25} sx={{ mt: 1 }}>
              {acquisitions.map((entry) => (
                <Typography key={entry.tier} variant="body2" color={entry.type ? 'text.primary' : 'warning.main'}>
                  {entry.type
                    ? t('trait-tier-acquisition', {
                        tier: toRoman(entry.tier),
                        prerequisite: prerequisiteLabel({ type: entry.type, value: entry.value }),
                      })
                    : t('trait-tier-unmet', { tier: toRoman(entry.tier) })}
                </Typography>
              ))}
            </Stack>
          )}
          {gameMaster && masterTypes.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <SectionLabel>{t('trait-prerequisite-grant')}</SectionLabel>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={chosen}
                onChange={(_, value: PrerequisiteChoice | null) => value && setChosen(value)}
                aria-label={t('trait-prerequisite-grant')}
                sx={{ flexWrap: 'wrap' }}
              >
                <ToggleButton value="auto">{t('trait-prerequisite-auto')}</ToggleButton>
                {masterTypes.map((type) => (
                  <ToggleButton key={type} value={type}>
                    {t(`trait-prerequisite-${type}`)}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              {chosen !== 'auto' && (
                <TextField
                  size="small"
                  fullWidth
                  sx={{ mt: 1 }}
                  label={t('trait-prerequisite-note')}
                  value={prerequisiteNote}
                  onChange={(event) => setPrerequisiteNote(event.target.value)}
                  slotProps={{ htmlInput: { maxLength: 500 } }}
                />
              )}
            </Box>
          )}
          {!gameMaster && unmet && masterTypes.length > 0 && (
            <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 1 }}>
              {t('trait-prerequisite-ask-master')}
            </Typography>
          )}
        </Box>
      )}

      {!trait.isTalent && currentLink && (
        <Typography variant="body2">
          {t('trait-linked-to', {
            talent: [traitName(currentLink.traitId), currentLink.specialization].filter(Boolean).join(' '),
          })}
        </Typography>
      )}
      {!trait.isTalent && !current && linkable.length > 0 && (
        <TextField
          select
          size="small"
          fullWidth
          label={t('trait-link')}
          helperText={t('trait-link-help')}
          value={linkKey}
          onChange={(event) => setLinkKey(event.target.value)}
        >
          <MenuItem value="">{t('trait-link-none')}</MenuItem>
          {linkable.map((owned) => (
            <MenuItem key={traitKey(owned)} value={traitKey(owned)}>
              {ownedName(owned)}
            </MenuItem>
          ))}
        </TextField>
      )}
      {pendingApprovalExpected && <Alert severity="info">{t('trait-pending-approval-info')}</Alert>}

      {gameMaster && (
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={restricted || !!current?.restricted}
                disabled={!!current?.restricted}
                onChange={(_, checked) => setRestricted(checked)}
              />
            }
            label={t('trait-restricted')}
          />
          <Typography variant="caption" color="text.secondary" component="div">
            {current?.restricted
              ? t('trait-restricted-kept', { note: current.restricted.note })
              : t('trait-restricted-help')}
          </Typography>
          {restricted && !current?.restricted && (
            <TextField
              size="small"
              fullWidth
              sx={{ mt: 1 }}
              label={t('trait-restricted-note')}
              value={restrictedNote}
              onChange={(event) => setRestrictedNote(event.target.value)}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />
          )}
        </Box>
      )}
    </Stack>
  );
};

export default TraitPurchaseRules;
