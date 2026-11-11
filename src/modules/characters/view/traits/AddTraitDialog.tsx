import { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import {
  BonusDevPointsSummary,
  Character,
  EmptyState,
  RmuDialog,
  StrategicGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { resolvePowerLevel } from '../../../services/game-rules';
import TalentPolicyChip from '../../../shared/chips/TalentPolicyChip';
import MultilingualRanksPicker from './MultilingualRanksPicker';
import TraitDetail from './TraitDetail';
import TraitListPanel from './TraitListPanel';
import TraitPurchaseRules from './TraitPurchaseRules';
import { talentPolicyOf } from './trait-rules';
import { useAddTraitForm } from './use-add-trait-form';

/**
 * Trait selector: a searchable list grouped by category with the cost and the reason a trait cannot be bought, and a
 * detail panel with the tier, the specialization, the total cost and the points that pay it. Full screen below `md`,
 * where the list and the detail are two steps. Everything is reset on close.
 */
const AddTraitDialog: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  strategicGame?: StrategicGame;
  open: boolean;
  onClose: () => void;
}> = ({ character, setCharacter, strategicGame, open, onClose }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('md'));
  const state = useAddTraitForm({ character, setCharacter, strategicGame, open, onClose });
  const {
    form,
    update,
    catalog,
    gameMaster,
    rulesOn,
    current,
    purchase,
    acquisitions,
    linkable,
    multilingual,
    valid,
    changeSpecialization,
    submit,
    handleClose,
  } = state;
  const { selected, tier, specialization, showDetail, submitting, pool } = form;
  const powerLevel = resolvePowerLevel(strategicGame?.powerLevel);
  const listVisible = !compact || !showDetail;
  const detailVisible = !compact || showDetail;

  return (
    <RmuDialog
      open={open}
      title={t('add-trait')}
      fullScreen={compact}
      maxWidth="lg"
      paperSx={compact ? undefined : { height: '85vh' }}
      onCancel={handleClose}
      buttons={
        <Button onClick={submit} variant="contained" disabled={!valid || submitting}>
          {purchase?.isImprovement ? t('trait-improve') : purchase?.isLowering ? t('trait-lower') : t('add')}
        </Button>
      }
    >
      <Stack sx={{ gap: 2, minHeight: 0, height: '100%' }}>
        {compact && showDetail && (
          <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={() => update({ showDetail: false })}>
              {t('back')}
            </Button>
          </Box>
        )}
        <Stack
          direction="row"
          sx={{ flexWrap: 'wrap', alignItems: 'center', columnGap: 3, rowGap: 1 }}
          aria-label={t('trait-resources')}
        >
          <Typography variant="body2" color="text.secondary">
            {t('dp-available')}: <b>{character.experience.availableDevPoints ?? 0}</b>
          </Typography>
          <BonusDevPointsSummary
            character={character}
            strategicGame={strategicGame}
            limit={powerLevel.raceDevPointsPerLevel}
          />
          <Typography variant="body2" color="text.secondary">
            {t('max-trait-cost')}: <b>{powerLevel.maxTraitCost}</b>
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('talent-policy')}:
            </Typography>
            <TalentPolicyChip policy={talentPolicyOf(strategicGame)} />
          </Stack>
        </Stack>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 5fr) minmax(0, 7fr)' },
          }}
        >
          {listVisible && (
            <Box sx={{ minHeight: { xs: 320, md: 0 }, display: 'flex' }}>
              <TraitListPanel character={character} state={state} />
            </Box>
          )}
          {detailVisible && (
            <Box sx={{ minHeight: 0, overflowY: 'auto' }}>
              {selected && purchase ? (
                <TraitDetail
                  character={character}
                  trait={selected}
                  tier={tier}
                  setTier={(value) => update({ tier: value })}
                  specialization={specialization}
                  setSpecialization={changeSpecialization}
                  purchase={purchase}
                  pool={pool}
                  setPool={(value) => update({ pool: value })}
                  extra={
                    <>
                      {multilingual && (
                        <MultilingualRanksPicker
                          realmId={strategicGame?.realmId}
                          rows={form.languageRows}
                          onChange={(languageRows) => update({ languageRows })}
                        />
                      )}
                      <TraitPurchaseRules
                        trait={selected}
                        catalog={catalog}
                        current={current}
                        rulesOn={rulesOn}
                        gameMaster={gameMaster}
                        acquisitions={acquisitions}
                        chosen={form.chosenPrerequisite}
                        setChosen={(chosenPrerequisite) => update({ chosenPrerequisite })}
                        prerequisiteNote={form.prerequisiteNote}
                        setPrerequisiteNote={(prerequisiteNote) => update({ prerequisiteNote })}
                        linkable={linkable}
                        linkKey={form.linkKey}
                        setLinkKey={(linkKey) => update({ linkKey })}
                        restricted={form.restricted}
                        setRestricted={(restricted) => update({ restricted })}
                        restrictedNote={form.restrictedNote}
                        setRestrictedNote={(restrictedNote) => update({ restrictedNote })}
                      />
                    </>
                  }
                />
              ) : (
                <EmptyState dense title={t('trait-select-hint')} />
              )}
            </Box>
          )}
        </Box>
      </Stack>
    </RmuDialog>
  );
};

export default AddTraitDialog;
