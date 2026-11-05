import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { Character, GameTimeLogCharacter, PassTimeRestResult } from '@labcabrera-rmu/rmu-react-shared-lib';

/** The rest took fatigue away (spec 077). */
const fatigueRecovered = (result: PassTimeRestResult): boolean =>
  result.fatigueBefore !== undefined &&
  result.fatigueAfter !== undefined &&
  result.fatigueBefore !== result.fatigueAfter;

/** What a step of time did (or would do) to each character (spec 065): hits, power points and injury days. */
const PassTimeResults: FC<{
  results: GameTimeLogCharacter[];
  characters?: Character[];
  /** A failed character: rest it alone with the dialog of one character */
  onRetry?: (character: Character, result: GameTimeLogCharacter) => void;
  dense?: boolean;
}> = ({ results, characters, onRetry, dense = false }) => {
  const { t } = useTranslation();
  const byId = new Map((characters ?? []).map((c) => [c.id, c]));

  return (
    <Table size="small" sx={dense ? { '& td, & th': { px: 1 } } : undefined}>
      <TableHead>
        <TableRow>
          <TableCell>{t('character')}</TableCell>
          <TableCell>{t('pass-time-activity')}</TableCell>
          <TableCell>{t('hp')}</TableCell>
          <TableCell>{t('power-points')}</TableCell>
          <TableCell>{t('injuries')}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {[...results]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((entry) => {
            const result = entry.result;
            const character = byId.get(entry.characterId);
            return (
              <TableRow key={entry.characterId}>
                <TableCell>{entry.name}</TableCell>
                <TableCell>{t(`activity-${entry.activity}`)}</TableCell>
                {entry.error ? (
                  <TableCell colSpan={3}>
                    <Typography variant="body2" color="error" component="span" sx={{ mr: 1 }}>
                      {t('pass-time-failed', { error: t(entry.error.code) })}
                    </Typography>
                    {onRetry && character && (
                      <Button size="small" onClick={() => onRetry(character, entry)}>
                        {t('pass-time-apply-pending-rest')}
                      </Button>
                    )}
                  </TableCell>
                ) : result ? (
                  <>
                    <TableCell>
                      {result.hpBefore === result.hpAfter ? result.hpAfter : `${result.hpBefore} → ${result.hpAfter}`}
                    </TableCell>
                    <TableCell>
                      {result.powerBefore === null || result.powerAfter === null
                        ? '—'
                        : result.powerBefore === result.powerAfter
                          ? result.powerAfter
                          : `${result.powerBefore} → ${result.powerAfter}`}
                    </TableCell>
                    <TableCell>
                      {result.injuries.length === 0 &&
                      (result.poisonings ?? []).length === 0 &&
                      !fatigueRecovered(result)
                        ? '—'
                        : [
                            ...result.injuries.map((injury) => (
                              <Chip
                                key={injury.injuryId}
                                size="small"
                                variant="outlined"
                                color={injury.status === 'healed' ? 'success' : 'default'}
                                label={
                                  injury.status === 'healed'
                                    ? t('pass-time-injury-healed')
                                    : t('pass-time-injury-days', { count: injury.remainingDays })
                                }
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            )),
                            ...(result.poisonings ?? []).map((poisoning) => (
                              <Chip
                                key={poisoning.injuryId}
                                size="small"
                                variant="outlined"
                                color="warning"
                                label={t('pass-time-poisoning', { status: t(`injury-status-${poisoning.status}`) })}
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            )),
                            // Spec 077: fatigue recovered resting
                            ...(fatigueRecovered(result)
                              ? [
                                  <Chip
                                    key="fatigue"
                                    size="small"
                                    variant="outlined"
                                    color="success"
                                    label={t('pass-time-fatigue', {
                                      before: -(result.fatigueBefore ?? 0),
                                      after: -(result.fatigueAfter ?? 0),
                                    })}
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />,
                                ]
                              : []),
                          ]}
                    </TableCell>
                  </>
                ) : (
                  <TableCell colSpan={3}>
                    <Typography variant="body2" color="text.secondary">
                      {t('pass-time-no-changes')}
                    </Typography>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
};

export default PassTimeResults;
