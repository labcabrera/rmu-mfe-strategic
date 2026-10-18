import React, { SyntheticEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useParams } from 'react-router-dom';
import { Box, Grid, Tab, Tabs, Typography } from '@mui/material';
import {
  AddItemDto,
  Character,
  ErrorState,
  fetchCharacter,
  GenericAvatar,
  LayoutBase,
  LoadingState,
  NotFound,
  TechnicalInfo,
  useEntity,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import TradeManeuverForm from './TradeManeuverForm';
import TradeViewItemSearch from './TradeViewItemSearch';
import TradeViewOptions from './TradeViewOptions';
import { TradeViewFormData } from './TradeViewOptionsForm';

const tradeOptions: TradeViewFormData['option'][] = ['buy', 'sell'];

export default function TradeView() {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const { characterId } = useParams<{ characterId: string }>();
  const state = useEntity<Character>(characterId, (id) => fetchCharacter(id, auth), { onError: notify.error });
  const character = state.entity;
  const [formData, setFormData] = useState<TradeViewFormData>({
    option: 'buy',
    communications: 'normal',
    population: 'normal',
    economy: 'normal',
    trade: 'none',
    itemType: 'normal',
    languageOptions: 'none',
  });
  const [itemFormData, setItemFormData] = useState<AddItemDto>({} as AddItemDto);

  const onTradeOptionChange = (_event: SyntheticEvent, option: TradeViewFormData['option']) => {
    setFormData({ ...formData, option });
  };

  return (
    <LayoutBase
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-module'), link: '/strategic' },
        { name: t('characters'), link: '/strategic/characters' },
        { name: t('trade') },
      ]}
      leftPanel={
        <>
          <Typography>{character?.name}</Typography>
          <GenericAvatar imageUrl={character?.imageUrl || ''} />
        </>
      }
    >
      {!character ? (
        state.notFound ? (
          <NotFound />
        ) : state.error ? (
          <ErrorState error={state.error} onRetry={state.refresh} />
        ) : (
          <LoadingState />
        )
      ) : (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={formData.option} onChange={onTradeOptionChange} variant="scrollable" scrollButtons="auto">
              {tradeOptions.map((option) => (
                <Tab
                  key={option}
                  label={t(option)}
                  value={option}
                  id={`trade-tab-${option}`}
                  aria-controls={`trade-tabpanel-${option}`}
                />
              ))}
            </Tabs>
          </Box>
          <Grid container spacing={1}>
            <Grid size={12}>
              <TradeViewOptions formData={formData} setFormData={setFormData} />
            </Grid>
            {formData.option === 'buy' && (
              <Grid size={12}>
                <TradeViewItemSearch formData={itemFormData} setFormData={setItemFormData} />
              </Grid>
            )}
            <Grid size={12}>
              <TradeManeuverForm character={character} action={formData.option} />
            </Grid>
          </Grid>
          <TechnicalInfo>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </TechnicalInfo>
        </Box>
      )}
    </LayoutBase>
  );
}
