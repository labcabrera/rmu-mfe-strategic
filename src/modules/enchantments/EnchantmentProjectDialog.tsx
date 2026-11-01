/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Box, Button, Chip, Divider, Grid, LinearProgress, Stack, TextField, Typography } from '@mui/material';
import {
  cancelEnchantment,
  completeEnchantment,
  ConfirmDialog,
  D100,
  deleteEnchantment,
  EnchantmentProject,
  EnchantmentScr,
  enchantmentTotalDays,
  fetchEnchantment,
  isEnchantmentActive,
  KeyValueList,
  LoadingState,
  MoneyDisplay,
  NumericInput,
  progressEnchantment,
  resumeEnchantment,
  RmuDialog,
  RollField,
  sendEnchantmentFailureRolls,
  StatusBadge,
  suspendEnchantment,
  updateEnchantment,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import EnchantmentPlanView from './EnchantmentPlanView';
import { enchantmentPercent, pendingFailures, STATUS_COLORS } from './enchantment-format';

type Confirm = 'complete' | 'cancel' | 'delete';

/**
 * An enchantment project (spec 064): its progress, the SCR of each spell with the failure found in its table, the
 * failure rolls still missing, and the actions its status allows. Every change answers the project as it is now.
 */
const EnchantmentProjectDialog: FC<{
  projectId: string;
  initial?: EnchantmentProject;
  onClose: () => void;
  onChanged: (project: EnchantmentProject) => void;
  onDeleted: () => void;
}> = ({ projectId, initial, onClose, onChanged, onDeleted }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const [project, setProject] = useState<EnchantmentProject | undefined>(initial);
  const [busy, setBusy] = useState(false);
  const [days, setDays] = useState<number | null>(1);
  const [failureRolls, setFailureRolls] = useState<Record<string, number>>({});
  const [adjusting, setAdjusting] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>();

  useEffect(() => {
    fetchEnchantment(projectId, auth).then(setProject).catch(notify.error);
  }, [projectId]);

  const run = (action: () => Promise<EnchantmentProject>, message?: string) => {
    setBusy(true);
    return action()
      .then((updated) => {
        setProject(updated);
        onChanged(updated);
        if (message) notify.success(message);
      })
      .catch(notify.error)
      .finally(() => setBusy(false));
  };

  const onConfirm = () => {
    if (!project || !confirm) return;
    const kind = confirm;
    setConfirm(undefined);
    if (kind === 'complete') {
      run(() => completeEnchantment(project.id, auth).then((result) => result.project), t('enchantment-completed'));
    } else if (kind === 'cancel') {
      run(() => cancelEnchantment(project.id, auth), t('enchantment-cancelled'));
    } else {
      setBusy(true);
      deleteEnchantment(project.id, auth)
        .then(onDeleted)
        .catch(notify.error)
        .finally(() => setBusy(false));
    }
  };

  const title = project ? t(project.itemName, project.itemName) : t('enchantment');

  if (!project) {
    return (
      <RmuDialog open maxWidth="md" title={title} onClose={onClose}>
        <LoadingState />
      </RmuDialog>
    );
  }

  const total = enchantmentTotalDays(project);
  const pending = pendingFailures(project);
  const status = project.status;
  const active = isEnchantmentActive(status);
  const finished = project.daysCompleted >= total;
  const spellName = (spellId: string) => {
    const spell = project.plan.spells.find((other) => other.spellId === spellId);
    return spell ? `${t(spell.name, spell.name)} (${spell.level})` : spellId;
  };

  return (
    <RmuDialog
      open
      maxWidth="md"
      title={title}
      subtitle={t('enchantment-by', { name: project.alchemistName })}
      onClose={onClose}
      buttons={
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }} useFlexGap>
          {status === 'in-progress' && (
            <Button disabled={busy} onClick={() => run(() => suspendEnchantment(project.id, auth))}>
              {t('enchantment-suspend')}
            </Button>
          )}
          {status === 'suspended' && (
            <Button disabled={busy} onClick={() => run(() => resumeEnchantment(project.id, auth))}>
              {t('enchantment-resume')}
            </Button>
          )}
          {active && (
            <Button disabled={busy} onClick={() => setAdjusting(true)}>
              {t('enchantment-adjust')}
            </Button>
          )}
          {active && (
            <Button color="error" disabled={busy} onClick={() => setConfirm('cancel')}>
              {t('enchantment-cancel')}
            </Button>
          )}
          {!active && (
            <Button color="error" disabled={busy} onClick={() => setConfirm('delete')}>
              {t('delete')}
            </Button>
          )}
          {status === 'in-progress' && (
            <Button variant="contained" disabled={busy || !finished} onClick={() => setConfirm('complete')}>
              {t('enchantment-complete')}
            </Button>
          )}
          <Button onClick={onClose}>{t('close')}</Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
          <StatusBadge
            status={`enchantment-${status}`}
            label={t(`enchantment-status-${status}`)}
            abbr={t(`enchantment-status-${status}`)}
            color={STATUS_COLORS[status]}
            size="medium"
          />
          <Typography variant="body2" color="text.secondary">
            {t('enchantment-days-of', { done: project.daysCompleted, total })}
          </Typography>
        </Stack>
        <LinearProgress variant="determinate" value={enchantmentPercent(project)} />

        {status === 'in-progress' && !finished && (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 140 }}>
              <NumericInput label={t('days')} value={days} onChange={setDays} min={1} integer />
            </Box>
            <Button
              variant="outlined"
              disabled={busy || !days || days < 1}
              onClick={() => run(() => progressEnchantment(project.id, days ?? 1, auth))}
            >
              {t('enchantment-progress-days')}
            </Button>
          </Stack>
        )}
        {status === 'in-progress' && finished && <Alert severity="success">{t('enchantment-ready')}</Alert>}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <KeyValueList
              rows={[
                { label: t('enchantment-working-days'), value: project.plan.workingDays },
                { label: t('enchantment-extra-days'), value: project.extraDays },
                { label: t('enchantment-pp-per-day'), value: project.plan.ppPerDay },
                { label: t('enchantment-item-level'), value: project.plan.itemLevel },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <KeyValueList
              rows={[
                { label: t('enchantment-paid'), value: <MoneyDisplay gold={project.paid} /> },
                { label: t('enchantment-extra-cost'), value: <MoneyDisplay gold={project.extraCost} /> },
                ...(project.refunded > 0
                  ? [{ label: t('enchantment-refunded'), value: <MoneyDisplay gold={project.refunded} /> }]
                  : []),
                { label: t('enchantment-market-value'), value: <MoneyDisplay gold={project.plan.marketValue} /> },
              ]}
            />
          </Grid>
        </Grid>
        {project.notes && (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {project.notes}
          </Typography>
        )}

        <Divider />
        <Typography variant="overline" color="text.secondary">
          {t('enchantment-scr-results')}
        </Typography>
        {project.scr.map((scr) => (
          <ScrResult
            key={scr.spellId}
            scr={scr}
            name={spellName(scr.spellId)}
            roll={failureRolls[scr.spellId]}
            onRoll={(value) => setFailureRolls((current) => ({ ...current, [scr.spellId]: value }))}
          />
        ))}
        {status === 'pending-failures' && pending.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Alert severity="warning" sx={{ flex: 1 }}>
              {t('enchantment-failure-rolls-pending')}
            </Alert>
            <Button
              variant="contained"
              disabled={busy || pending.some((scr) => failureRolls[scr.spellId] === undefined)}
              onClick={() =>
                run(() =>
                  sendEnchantmentFailureRolls(
                    project.id,
                    Object.fromEntries(pending.map((scr) => [scr.spellId, failureRolls[scr.spellId]])),
                    auth
                  )
                )
              }
            >
              {t('enchantment-send-failure-rolls')}
            </Button>
          </Stack>
        )}

        <Divider />
        <Typography variant="overline" color="text.secondary">
          {t('enchantment-quote')}
        </Typography>
        <EnchantmentPlanView plan={project.plan} free={!project.payer} />
      </Stack>

      {adjusting && (
        <EnchantmentAdjustDialog
          project={project}
          onClose={() => setAdjusting(false)}
          onSave={(dto) => {
            setAdjusting(false);
            run(() => updateEnchantment(project.id, { ...dto, version: project.version }, auth));
          }}
        />
      )}
      {confirm && (
        <ConfirmDialog
          open
          title={t(`enchantment-confirm-${confirm}-title`)}
          message={t(`enchantment-confirm-${confirm}`)}
          destructive={confirm !== 'complete'}
          onConfirm={onConfirm}
          onClose={() => setConfirm(undefined)}
        />
      )}
    </RmuDialog>
  );
};

/** The SCR of one spell: its roll and total, and on a failure the failure roll and the row of its table. */
const ScrResult: FC<{
  scr: EnchantmentScr;
  name: string;
  roll: number | undefined;
  onRoll: (value: number) => void;
}> = ({ scr, name, roll, onRoll }) => {
  const { t } = useTranslation();
  return (
    <Stack spacing={1} sx={{ pl: 1, borderLeft: 3, borderColor: scr.failed ? 'error.main' : 'success.main' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('enchantment-scr-line', { roll: scr.roll, total: scr.total })}
        </Typography>
        <Chip
          size="small"
          color={scr.failed ? 'error' : 'success'}
          label={t(scr.failed ? 'enchantment-scr-failed' : 'enchantment-scr-passed')}
        />
        {scr.failure?.serendipity && (
          <Chip size="small" color="secondary" label={t(`enchantment-serendipity-${scr.failure.serendipity}`)} />
        )}
      </Stack>
      {scr.failed && scr.failureRoll === null && (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
          <RollField
            spec={D100}
            label={t('enchantment-failure-roll')}
            value={roll}
            onChange={(value) => onRoll(value.total)}
          />
          <Typography variant="caption" color="text.secondary">
            {t('enchantment-failure-modifier', { value: scr.failureModifier })}
          </Typography>
        </Stack>
      )}
      {scr.failed && scr.failureRoll !== null && (
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t('enchantment-failure-line', {
              table: t(`alchemy-failure-table-${scr.failure?.table ?? ''}`),
              roll: scr.failureRoll,
              modifier: scr.failureModifier,
              total: scr.failureRoll + scr.failureModifier,
            })}
          </Typography>
          {scr.failure && (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {scr.failure.text}
            </Typography>
          )}
        </Box>
      )}
    </Stack>
  );
};

/** Extra days and cost of the failures (the cost is charged to the payer), and notes. */
const EnchantmentAdjustDialog: FC<{
  project: EnchantmentProject;
  onClose: () => void;
  onSave: (dto: { extraDays: number; extraCost: number; notes: string | null }) => void;
}> = ({ project, onClose, onSave }) => {
  const { t } = useTranslation();
  const [extraDays, setExtraDays] = useState<number | null>(project.extraDays);
  const [extraCost, setExtraCost] = useState<number | null>(project.extraCost);
  const [notes, setNotes] = useState(project.notes ?? '');
  return (
    <RmuDialog
      open
      maxWidth="sm"
      title={t('enchantment-adjust')}
      subtitle={t(project.itemName, project.itemName)}
      onClose={onClose}
      buttons={
        <>
          <Button onClick={onClose}>{t('cancel')}</Button>
          <Button
            variant="contained"
            onClick={() =>
              onSave({ extraDays: extraDays ?? 0, extraCost: extraCost ?? 0, notes: notes.trim() || null })
            }
          >
            {t('save')}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {t('enchantment-adjust-hint')}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={6}>
            <NumericInput
              label={t('enchantment-extra-days')}
              value={extraDays}
              onChange={setExtraDays}
              min={0}
              integer
            />
          </Grid>
          <Grid size={6}>
            <NumericInput
              label={t('enchantment-extra-cost')}
              value={extraCost}
              onChange={setExtraCost}
              min={0}
              maxFractionDigits={2}
            />
          </Grid>
        </Grid>
        <TextField label={t('notes')} value={notes} onChange={(e) => setNotes(e.target.value)} multiline minRows={3} />
      </Stack>
    </RmuDialog>
  );
};

export default EnchantmentProjectDialog;
