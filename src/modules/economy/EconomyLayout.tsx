import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import BuildIcon from '@mui/icons-material/Build';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { Avatar, Button, Paper, Stack, Typography } from '@mui/material';
import {
  ErrorState,
  LayoutBase,
  LoadingState,
  MoneyDisplay,
  resolveAssetUrl,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { DEFAULT_FACTION_IMAGE_PATH } from '../services/image-service';
import { HolderView, holderPath, holderViewPath } from './use-holder';

/** Layout of the market and the workshop: breadcrumbs, the holder with its gold, and the switch between pages. */
const EconomyLayout: FC<{
  page: 'market' | 'workshop';
  view: HolderView | undefined;
  error?: unknown;
  onRetry: () => void;
  children: ReactNode;
}> = ({ page, view, error, onRetry, children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const image = view?.imageUrl
    ? resolveAssetUrl(view.imageUrl)
    : view?.holder.kind === 'faction'
      ? resolveAssetUrl(DEFAULT_FACTION_IMAGE_PATH)
      : undefined;
  const other = page === 'market' ? 'workshop' : 'market';

  return (
    <LayoutBase
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-module'), link: '/strategic' },
        ...(view
          ? [
              {
                name: view.holder.kind === 'faction' ? t('armory-of', { name: view.name }) : view.name,
                link: holderViewPath(view.holder),
              },
            ]
          : []),
        { name: t(page) },
      ]}
    >
      {!view ? (
        error ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : (
          <LoadingState />
        )
      ) : (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
            >
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Avatar src={image} alt={view.name} sx={{ width: 56, height: 56 }} />
                <Stack>
                  <Typography variant="overline" color="text.secondary">
                    {t(view.holder.kind === 'faction' ? 'armory' : 'character')}
                  </Typography>
                  <Typography variant="h6">{view.name}</Typography>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={3} sx={{ alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
                <Stack>
                  <Typography variant="caption" color="text.secondary">
                    {t(view.holder.kind === 'faction' ? 'faction-gold' : 'character-gold')}
                  </Typography>
                  <MoneyDisplay gold={view.gold} variant="subtitle1" showIcon />
                </Stack>
                {view.holder.kind === 'character' && view.faction && (
                  <Stack>
                    <Typography variant="caption" color="text.secondary">
                      {t('faction-gold')}
                    </Typography>
                    <MoneyDisplay gold={view.faction.management.availableGold} variant="subtitle1" showIcon />
                  </Stack>
                )}
                <Button
                  variant="outlined"
                  startIcon={other === 'market' ? <StorefrontIcon /> : <BuildIcon />}
                  onClick={() => navigate(holderPath(other, view.holder))}
                >
                  {t(other)}
                </Button>
              </Stack>
            </Stack>
          </Paper>
          {children}
        </Stack>
      )}
    </LayoutBase>
  );
};

export default EconomyLayout;
