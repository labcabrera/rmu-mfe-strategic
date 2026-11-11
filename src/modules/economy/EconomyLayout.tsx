import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BuildIcon from '@mui/icons-material/Build';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { Box, Button, Stack, Typography } from '@mui/material';
import {
  ErrorState,
  HeroHeader,
  LayoutBase,
  LoadingState,
  MoneyDisplay,
  SectionDef,
  SectionNav,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { DEFAULT_FACTION_IMAGE_PATH } from '../services/image-service';
import { ECONOMY_PAGES, EconomyPage, HolderView, holderPath, holderViewPath } from './use-holder';

const PAGE_ICONS: Record<EconomyPage, React.ReactElement> = {
  market: <StorefrontIcon />,
  workshop: <BuildIcon />,
  enchantments: <AutoAwesomeIcon />,
};

/** The tabs of an economy page, kept in its `tab` query param, and controls at their right. */
interface EconomyTabs {
  sections: SectionDef[];
  value: string;
  onChange: (id: string) => void;
  extra?: ReactNode;
}

/**
 * Layout of the market, the workshop and the enchantments (spec 064): breadcrumbs, the holder with its gold in a
 * HeroHeader, the links to the other pages and the tabs of the page as a SectionNav (spec 066).
 */
const EconomyLayout: FC<{
  page: EconomyPage;
  view: HolderView | undefined;
  error?: unknown;
  onRetry: () => void;
  tabs?: EconomyTabs;
  children: ReactNode;
}> = ({ page, view, error, onRetry, tabs, children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const image = view?.imageUrl ?? (view?.holder.kind === 'faction' ? DEFAULT_FACTION_IMAGE_PATH : undefined);
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
          <HeroHeader
            title={view.name}
            overline={t(view.holder.kind === 'faction' ? 'armory' : 'character')}
            image={image}
            pills={
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
              </Stack>
            }
            actions={
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
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
            }
          />
          {tabs && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ borderBottom: 1, borderColor: 'divider', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <SectionNav sections={tabs.sections} value={tabs.value} onChange={tabs.onChange} label={t(page)} />
              </Box>
              {tabs.extra}
            </Stack>
          )}
          {children}
        </Stack>
      )}
    </LayoutBase>
  );
};

export default EconomyLayout;
