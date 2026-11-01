import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BuildIcon from '@mui/icons-material/Build';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { Button, Paper, Stack, Typography } from '@mui/material';
import {
  EntityAvatar,
  ErrorState,
  LayoutBase,
  LoadingState,
  MoneyDisplay,
  resolveAssetUrl,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { DEFAULT_FACTION_IMAGE_PATH } from '../services/image-service';
import { ECONOMY_PAGES, EconomyPage, HolderView, holderPath, holderViewPath } from './use-holder';

const PAGE_ICONS: Record<EconomyPage, React.ReactElement> = {
  market: <StorefrontIcon />,
  workshop: <BuildIcon />,
  enchantments: <AutoAwesomeIcon />,
};

/**
 * Layout of the market, the workshop and the enchantments (spec 064): breadcrumbs, the holder with its gold, and the
 * links to the other pages.
 */
const EconomyLayout: FC<{
  page: EconomyPage;
  view: HolderView | undefined;
  error?: unknown;
  onRetry: () => void;
  children: ReactNode;
}> = ({ page, view, error, onRetry, children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const image = view?.imageUrl
    ? resolveAssetUrl(view.imageUrl)
    : view?.holder.kind === 'faction'
      ? resolveAssetUrl(DEFAULT_FACTION_IMAGE_PATH)
      : undefined;
  const others = ECONOMY_PAGES.filter((value) => value !== page);
  // The other page opens on its first tab, with the same filters of the catalog (spec 056, B-04)
  const otherPath = (other: EconomyPage, holder: HolderView['holder']) => {
    const query = new URLSearchParams(params);
    query.delete('tab');
    const search = query.toString();
    return `${holderPath(other, holder)}${search ? `?${search}` : ''}`;
  };

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
                <EntityAvatar name={view.name} imageUrl={image} size={56} />
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
                {others.map((other) => (
                  <Button
                    key={other}
                    variant="outlined"
                    startIcon={PAGE_ICONS[other]}
                    onClick={() => navigate(otherPath(other, view.holder))}
                  >
                    {t(other)}
                  </Button>
                ))}
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
