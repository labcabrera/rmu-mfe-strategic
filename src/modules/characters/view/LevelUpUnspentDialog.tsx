import { useTranslation } from 'react-i18next';
import { Button, Typography } from '@mui/material';
import { RmuDialog } from '@labcabrera-rmu/rmu-react-shared-lib';

/**
 * Confirmation of a level up with unspent normal development points (Core Law §2.8, workspace spec 076, A5): they
 * are kept for the next level when the game master allows it, or lost.
 */
export function LevelUpUnspentDialog({
  name,
  unspent,
  canSave,
  onClose,
  onLevelUp,
}: {
  name: string;
  unspent?: number;
  canSave: boolean;
  onClose: () => void;
  onLevelUp: (mode: 'force' | 'save') => void;
}) {
  const { t } = useTranslation();
  return (
    <RmuDialog
      open={unspent !== undefined}
      title={t('level-up')}
      maxWidth="sm"
      onCancel={onClose}
      buttons={
        <>
          <Button color="error" variant={canSave ? 'outlined' : 'contained'} onClick={() => onLevelUp('force')}>
            {t('level-up-lose-dev-points')}
          </Button>
          {canSave && (
            <Button variant="contained" onClick={() => onLevelUp('save')}>
              {t('level-up-save-dev-points')}
            </Button>
          )}
        </>
      }
    >
      <Typography variant="body2">
        {t(canSave ? 'level-up-confirmation-save' : 'level-up-confirmation', { name, points: unspent ?? 0 })}
      </Typography>
    </RmuDialog>
  );
}
