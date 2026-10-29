/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Autocomplete, Box, Chip, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import {
  AddButton,
  Culture,
  CulturePicker,
  CultureSkillRank,
  DeleteButton,
  fetchEnumerations,
  NumericInput,
  Skill,
  SkillPicker,
  useSpecializationLabel,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import {
  CultureAssignmentRow,
  CultureEntryValidation,
  entrySkillOptions,
  initialRow,
  isAssignable,
  maxRanksPerSkill,
  requiresSpecialization,
} from '../../services/culture-assignments';

let nextRowKey = 1;
const newRowKey = () => nextRowKey++;

/** Rows of a newly selected culture: one per assignable entry, with the skill preset when there is only one. */
export const initialCultureRows = (culture: Culture | undefined, skills: Skill[]): CultureAssignmentRow[] =>
  (culture?.skillRanks || [])
    .map((entry, index) => (isAssignable(entry) ? initialRow(entry, index, newRowKey(), skills) : undefined))
    .filter((row): row is CultureAssignmentRow => !!row);

/**
 * Optional culture of a new character. 'skill' entries are listed read-only; every other entry gets a block to
 * distribute its ranks, with the pending ranks counter and the errors the API would return.
 */
const CharacterCreateCulture: FC<{
  realmId?: string;
  cultures: Culture[];
  culture?: Culture;
  onCultureChange: (culture: Culture | undefined) => void;
  rows: CultureAssignmentRow[];
  setRows: Dispatch<SetStateAction<CultureAssignmentRow[]>>;
  skills: Skill[];
  validation: Record<number, CultureEntryValidation>;
  onError: (error: unknown) => void;
}> = ({ realmId, cultures, culture, onCultureChange, rows, setRows, skills, validation, onError }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  // Spec 050: specializations are catalog keys shown by their name
  const specializationLabel = useSpecializationLabel();
  const [specializations, setSpecializations] = useState<Record<string, string[]>>({});

  // Loads the specializations (enumeration keys) of the skills used in the rows
  useEffect(() => {
    const categories = new Set<string>();
    rows.forEach((row) => {
      const category = skills.find((s) => s.id === row.skillId)?.specialization;
      if (category && !(category in specializations)) categories.add(category);
    });
    categories.forEach((category) => {
      setSpecializations((prev) => ({ ...prev, [category]: prev[category] ?? [] }));
      const realmQuery = realmId ? `;(realmId==${realmId},realmId==null)` : '';
      fetchEnumerations(`category==${category}${realmQuery}`, 0, 200, auth)
        .then((page) => setSpecializations((prev) => ({ ...prev, [category]: page.content.map((e) => e.key) })))
        .catch(onError);
    });
  }, [rows, skills, realmId]);

  const updateRow = (key: number, changes: Partial<CultureAssignmentRow>) =>
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...changes } : row)));

  const addRow = (entry: CultureSkillRank, index: number) => {
    const pending = validation[index]?.pending ?? entry.ranks;
    const row = initialRow(entry, index, newRowKey(), skills);
    setRows((prev) => [...prev, { ...row, ranks: Math.max(1, Math.min(pending, maxRanksPerSkill(entry))) }]);
  };

  const removeRow = (key: number) => setRows((prev) => prev.filter((row) => row.key !== key));

  const fixedEntries = (culture?.skillRanks || []).filter((entry) => entry.type === 'skill');

  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CulturePicker
            cultures={cultures}
            variant="select"
            value={culture?.id ?? null}
            onChange={(_, selected) => onCultureChange(selected)}
            placeholder={t('no-culture')}
            clearable
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="body2" color="text.secondary">
            {t('culture-creation-help')}
          </Typography>
        </Grid>
      </Grid>
      {culture && (
        <>
          {(culture.suggestedCrafts || culture.suggestedVocations) && (
            <Stack spacing={0.5}>
              {culture.suggestedCrafts && (
                <Typography variant="body2" color="text.secondary">
                  <b>{t('suggested-crafts')}:</b> {culture.suggestedCrafts}
                </Typography>
              )}
              {culture.suggestedVocations && (
                <Typography variant="body2" color="text.secondary">
                  <b>{t('suggested-vocations')}:</b> {culture.suggestedVocations}
                </Typography>
              )}
            </Stack>
          )}
          {fixedEntries.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                {t('culture-skill-rank-type-skill')}
              </Typography>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                {fixedEntries.map((entry, index) => (
                  <Chip
                    key={index}
                    variant="outlined"
                    label={`${t(entry.skillId || '')}${entry.specialization ? ` (${specializationLabel(entry.specialization)})` : ''} +${entry.ranks}`}
                  />
                ))}
              </Stack>
            </Box>
          )}
          {culture.skillRanks.map((entry, index) =>
            isAssignable(entry) ? (
              <CultureEntryBlock
                key={index}
                culture={culture}
                entry={entry}
                rows={rows.filter((row) => row.entry === index)}
                skills={skills}
                specializations={specializations}
                validation={validation[index]}
                onAdd={() => addRow(entry, index)}
                onUpdate={updateRow}
                onRemove={removeRow}
              />
            ) : null
          )}
        </>
      )}
    </Stack>
  );
};

const CultureEntryBlock: FC<{
  culture: Culture;
  entry: CultureSkillRank;
  rows: CultureAssignmentRow[];
  skills: Skill[];
  specializations: Record<string, string[]>;
  validation?: CultureEntryValidation;
  onAdd: () => void;
  onUpdate: (key: number, changes: Partial<CultureAssignmentRow>) => void;
  onRemove: (key: number) => void;
}> = ({ culture, entry, rows, skills, specializations, validation, onAdd, onUpdate, onRemove }) => {
  const { t } = useTranslation();
  // Spec 050: specializations are catalog keys shown by their name
  const specializationLabel = useSpecializationLabel();
  const options = entrySkillOptions(entry, skills);
  const max = maxRanksPerSkill(entry);
  const pending = validation?.pending ?? entry.ranks;

  const describe = (): string => {
    switch (entry.type) {
      case 'skill-choice':
        return (entry.skillIds?.length ? entry.skillIds : [entry.skillId || '']).map((id) => t(id)).join(', ');
      case 'category-pool':
        return (entry.categoryIds || []).map((id) => t(id)).join(', ');
      case 'region':
        return `${t(entry.skillId || '')} · ${t(`culture-region-${entry.region || 'own'}`)}`;
      case 'languages':
        return culture.languages?.length
          ? culture.languages.map((language) => specializationLabel(language)).join(', ')
          : t('culture-languages-all');
      default:
        return '';
    }
  };

  const specializationOptions = (row: CultureAssignmentRow): string[] => {
    if (entry.type === 'languages' && culture.languages?.length) return culture.languages;
    const category = skills.find((s) => s.id === row.skillId)?.specialization;
    return category ? specializations[category] || [] : [];
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', rowGap: 1 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" color="primary">
            {`${t(`culture-skill-rank-type-${entry.type}`)} · ${t('culture-entry-ranks', { count: entry.ranks })}`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {describe()}
            {Number.isFinite(max) ? ` · ${t('max-ranks-per-skill')}: ${max}` : ''}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Chip
            size="small"
            color={pending === 0 ? 'success' : 'warning'}
            label={
              pending >= 0
                ? t('culture-pending-ranks', { count: pending })
                : t('culture-exceeded-ranks', { count: -pending })
            }
          />
          <AddButton onClick={onAdd} disabled={pending <= 0} />
        </Stack>
      </Stack>
      <Stack spacing={1.5}>
        {rows.map((row) => {
          const skill = options.find((s) => s.id === row.skillId);
          const needsSpecialization = requiresSpecialization(entry, skill);
          // Closed lists of catalog keys (spec 050): the culture's languages or the enumerations of the realm
          const specializationChoices = specializationOptions(row);
          const error = validation?.rowErrors[row.key];
          return (
            <Box key={row.key}>
              <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <SkillPicker
                    skills={options}
                    variant="select"
                    value={row.skillId || null}
                    onChange={(id) => onUpdate(row.key, { skillId: id || '', specialization: '' })}
                    disabled={entry.type === 'region' || options.length === 1}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  {needsSpecialization && (
                    <Autocomplete
                      options={specializationChoices}
                      getOptionLabel={(option) => specializationLabel(option)}
                      value={row.specialization || null}
                      onChange={(_, value) => onUpdate(row.key, { specialization: value || '' })}
                      disabled={!row.skillId}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={
                            entry.type === 'languages'
                              ? t('language')
                              : entry.type === 'region'
                                ? t('region')
                                : t('specialization')
                          }
                          error={!!row.skillId && !row.specialization.trim()}
                          helperText={
                            row.skillId && specializationChoices.length === 0
                              ? t('specialization-catalog-empty')
                              : undefined
                          }
                          required
                        />
                      )}
                    />
                  )}
                </Grid>
                <Grid size={{ xs: 8, md: 3 }}>
                  <NumericInput
                    label={t('ranks')}
                    value={row.ranks}
                    onChange={(value) => onUpdate(row.key, { ranks: value || 0 })}
                    integer
                    allowNegatives={false}
                    min={1}
                    max={Number.isFinite(max) ? Math.min(max, entry.ranks) : entry.ranks}
                    error={!row.ranks}
                  />
                </Grid>
                <Grid size={{ xs: 4, md: 1 }}>
                  <DeleteButton onClick={() => onRemove(row.key)} />
                </Grid>
              </Grid>
              {error && (
                <Typography variant="caption" color="error">
                  {t(error)}
                </Typography>
              )}
            </Box>
          );
        })}
        {rows.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            {t('culture-no-assignments')}
          </Typography>
        )}
        {validation?.errors.includes('err-culture-incomplete-entry') && rows.length > 0 && (
          <Typography variant="caption" color="error">
            {t('err-culture-incomplete-entry')}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};

export default CharacterCreateCulture;
