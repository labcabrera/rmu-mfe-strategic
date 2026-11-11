import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Grid, TextField } from '@mui/material';
import { NumericInput, Section } from '@labcabrera-rmu/rmu-react-shared-lib';
import { GameFormSectionProps } from './game-form-section';

/** Calendar of the campaign (spec 065). */
const GameCalendarSection: FC<GameFormSectionProps & { editing: boolean }> = ({ formData, setFormData, editing }) => {
  const { t } = useTranslation();
  const calendar = formData.calendar ?? { startDate: '', elapsedDays: 0, elapsedHours: 0, currentDay: 1 };
  const setCalendar = (changes: Partial<typeof calendar>) =>
    setFormData((prevData) => ({ ...prevData, calendar: { ...calendar, ...changes } }));

  return (
    <Section title={t('calendar')}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: editing ? 8 : 12 }}>
          <TextField
            label={t('campaign-start-date')}
            name="startDate"
            value={calendar.startDate}
            onChange={(e) => setCalendar({ startDate: e.target.value })}
            helperText={t('campaign-start-date-help')}
            slotProps={{ htmlInput: { maxLength: 100 } }}
            fullWidth
          />
        </Grid>
        {editing && (
          <Grid size={{ xs: 12, md: 4 }}>
            <NumericInput
              integer
              min={0}
              allowNegatives={false}
              label={t('campaign-elapsed-days')}
              name="elapsedDays"
              value={calendar.elapsedDays}
              onChange={(value) => setCalendar({ elapsedDays: value ?? 0, currentDay: (value ?? 0) + 1 })}
            />
          </Grid>
        )}
        {editing && (
          <Grid size={12}>
            <Alert severity="warning">{t('campaign-elapsed-days-warning')}</Alert>
          </Grid>
        )}
      </Grid>
    </Section>
  );
};

export default GameCalendarSection;
