import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import {
  Alert,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  AMPUTATION_DIFFICULTY,
  AMPUTATION_INJURY_PENALTY,
  AMPUTATION_METHODS,
  AmputationMethod,
  AmputationResult,
  amputateCharacterLimb,
  BodySide,
  Character,
  HealerCandidate,
  HealerPicker,
  HealerSelection,
  isLimbLost,
  LOST_LIMB_LOCATIONS,
  LostLimbLocation,
  NumericInput,
  OPEN_D100,
  resolveHealer,
  RmuDialog,
  RollField,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useBusyAction } from '../../../shared/useBusyAction';

const SIDES: BodySide[] = ['left', 'right'];

/**
 * Workspace spec 079, C1 (§13.1): the game master amputates an arm or a leg, surgically (-50, cauterized or not) or in an
 * emergency (-30, always cauterized). The limb is lost whatever the result; the stump heals as its own -40 injuries. A
 * failure asks for a D Slash critical one result lower and an absolute failure is system shock, both resolved by hand.
 */
const AmputationDialog: FC<{
  character: Character;
  healers: HealerCandidate[];
  healerPenalties: Record<string, number>;
  open: boolean;
  onClose: () => void;
  onUpdated: (character: Character) => void;
}> = ({ character, healers, healerPenalties, open, onClose, onUpdated }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const [method, setMethod] = useState<AmputationMethod>('surgical');
  const [location, setLocation] = useState<LostLimbLocation>('arm');
  const [side, setSide] = useState<BodySide>('left');
  const [cauterized, setCauterized] = useState(false);
  const [injuryId, setInjuryId] = useState('');
  const [healer, setHealer] = useState<HealerSelection>({ mode: 'self' });
  const [roll, setRoll] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<number | undefined>();
  const { busy, run } = useBusyAction();
  const [outcome, setOutcome] = useState<AmputationResult<Character>>();

  useEffect(() => {
    if (!open) return;
    setMethod('surgical');
    setCauterized(false);
    setInjuryId('');
    setRoll(null);
    setDifficulty(undefined);
    setOutcome(undefined);
  }, [open]);

  const resolvedHealer = resolveHealer(healer, healers, character.id);
  const healerPenalty = resolvedHealer?.characterId ? healerPenalties[resolvedHealer.characterId] || 0 : 0;
  const difficultyValue = difficulty ?? AMPUTATION_DIFFICULTY[method];
  const total = (roll ?? 0) + (resolvedHealer?.medicine ?? 0) + healerPenalty + difficultyValue;
  const lost = isLimbLost(character.lostLimbs, location, side);
  const limbInjuries = (character.injuries || []).filter(
    (injury) => injury.status !== 'healed' && injury.location === location && (!injury.side || injury.side === side)
  );

  const submit = () => {
    if (!resolvedHealer || roll === null) return;
    run(
      amputateCharacterLimb(
        character.id,
        {
          method,
          location,
          side,
          ...(method === 'surgical' ? { cauterized } : {}),
          ...(injuryId ? { injuryId } : {}),
          ...(resolvedHealer.characterId
            ? { healerCharacterId: resolvedHealer.characterId }
            : { healer: { name: resolvedHealer.name, bonus: resolvedHealer.medicine } }),
          roll,
          ...(difficulty !== undefined ? { difficulty } : {}),
        },
        auth
      ),
      (result) => {
        onUpdated(result.character);
        setOutcome(result);
      }
    );
  };

  if (outcome) {
    return (
      <RmuDialog open={open} title={t('amputation')} subtitle={character.name} maxWidth="sm" onCancel={onClose}>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Alert severity={outcome.result.includes('failure') ? 'warning' : 'success'}>
            {t('amputation-result', {
              result: t(outcome.result),
              total: outcome.total,
              limb: t('lost-limb-label', {
                location: t(outcome.lostLimb.location),
                side: t(`side-${outcome.lostLimb.side}`),
              }),
            })}
          </Alert>
          <Typography variant="body2">{t('amputation-stump', { count: outcome.injuryIds.length })}</Typography>
          {outcome.consequence.critical && (
            <Alert severity="error">
              {t('amputation-critical', {
                type: outcome.consequence.critical.criticalType,
                severity: outcome.consequence.critical.criticalSeverity,
              })}
            </Alert>
          )}
          {outcome.consequence.systemShock && (
            <Alert severity="error">
              {t('amputation-system-shock', { dice: outcome.consequence.systemShock.dice })}
            </Alert>
          )}
        </Stack>
      </RmuDialog>
    );
  }

  return (
    <RmuDialog
      open={open}
      title={t('amputation')}
      subtitle={character.name}
      maxWidth="sm"
      onCancel={onClose}
      onConfirm={submit}
      onConfirmDisabled={busy || !resolvedHealer || roll === null || lost}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={method}
          onChange={(_, value: AmputationMethod | null) => value && setMethod(value)}
        >
          {AMPUTATION_METHODS.map((each) => (
            <ToggleButton key={each} value={each}>
              {t(`amputation-method-${each}`)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Typography variant="caption" color="text.secondary">
          {t(`amputation-method-${method}-help`, {
            difficulty: AMPUTATION_DIFFICULTY[method],
            penalty: AMPUTATION_INJURY_PENALTY,
          })}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t('location')}
              value={location}
              onChange={(e) => setLocation(e.target.value as LostLimbLocation)}
            >
              {LOST_LIMB_LOCATIONS.map((each) => (
                <MenuItem key={each} value={each}>
                  {t(each)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t('limb-side')}
              value={side}
              onChange={(e) => setSide(e.target.value as BodySide)}
            >
              {SIDES.map((each) => (
                <MenuItem key={each} value={each}>
                  {t(`side-${each}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        {lost && <Alert severity="warning">{t('err-limb-already-lost')}</Alert>}
        {method === 'surgical' && (
          <FormControlLabel
            control={<Checkbox checked={cauterized} onChange={(_, checked) => setCauterized(checked)} />}
            label={t('amputation-cauterized')}
          />
        )}
        <TextField
          select
          fullWidth
          size="small"
          label={t('amputation-source-injury')}
          value={injuryId}
          onChange={(e) => setInjuryId(e.target.value)}
        >
          <MenuItem value="">{t('none')}</MenuItem>
          {limbInjuries.map((injury) => (
            <MenuItem key={injury.id} value={injury.id}>
              {[t(`injury-type-${injury.type}`), injury.penalty, injury.description].filter(Boolean).join(' · ')}
            </MenuItem>
          ))}
        </TextField>
        <HealerPicker characters={healers} selfId={character.id} value={healer} onChange={setHealer} />
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 6 }}>
            <RollField spec={OPEN_D100} value={roll} onChange={(value) => setRoll(value.total)} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <NumericInput
              integer
              label={t('difficulty')}
              value={difficultyValue}
              onChange={(value) => setDifficulty(value ?? undefined)}
            />
          </Grid>
        </Grid>
        {resolvedHealer && roll !== null && (
          <Typography variant="body2">
            {t('amputation-total', {
              roll,
              medicine: resolvedHealer.medicine,
              penalty: healerPenalty,
              difficulty: difficultyValue,
              total,
            })}
          </Typography>
        )}
      </Stack>
    </RmuDialog>
  );
};

export default AmputationDialog;
