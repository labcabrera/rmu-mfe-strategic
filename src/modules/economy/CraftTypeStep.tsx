import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';
import { ItemCatalogBrowser, MoneyDisplay } from '@labcabrera-rmu/rmu-react-shared-lib';
import { materialsPriceOf } from './craft-rules';
import { CraftWizardState } from './use-craft-wizard';

/** First step of the craft wizard: the catalog to choose the item from. */
const CraftTypeStep: FC<{ wizard: CraftWizardState }> = ({ wizard }) => {
  const { t } = useTranslation();
  const { form, catalog, filters, rules, selectItem } = wizard;
  return (
    <ItemCatalogBrowser
      items={catalog.items}
      filters={filters}
      layout="drawer"
      truncated={catalog.truncated}
      error={catalog.error}
      refresh={catalog.refresh}
      storageKey="strategic.workshop"
      selectedId={form.itemType?.id}
      onSelect={selectItem}
      price={(item) => (
        <Stack component="span">
          <MoneyDisplay gold={materialsPriceOf(item, rules)} variant="subtitle2" />
          {item.info.productionHours !== null && (
            <Typography component="span" variant="caption" color="text.secondary">
              {t('production-hours-value', { hours: item.info.productionHours })}
            </Typography>
          )}
        </Stack>
      )}
    />
  );
};

export default CraftTypeStep;
