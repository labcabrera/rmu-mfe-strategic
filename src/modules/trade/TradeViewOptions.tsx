import React, { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, ButtonGroup, Button } from '@mui/material';

const options = ['buy', 'sell'];
const communicationOptions = ['normal', 'poor', 'excelent'];
const economyOptions = ['normal', 'poor', 'wealthy', 'barter-economy'];
const population = ['normal', 'lightly-populated', 'heavily-populated'];
const tradeOptions = ['none', 'barter-economy'];
const itemTypes = ['normal', 'inusual', 'especially useful', 'specialty-item', 'expensive', 'very-expensive', 'ilegal'];
const languageOptions = ['none', 'fewer-than-tree-ranks', 'more-than-six-ranks'];

const TradeViewOptions: FC<{
  formData: any;
  setFormData: Dispatch<SetStateAction<any>>;
}> = ({ formData, setFormData }) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={1}>
      <OptionGroup
        label={t('option')}
        options={options}
        value={formData?.option}
        onChange={(value) => setFormData({ ...formData, option: value })}
      />
      <OptionGroup
        label={t('communications')}
        options={communicationOptions}
        value={formData?.communications}
        onChange={(value) => setFormData({ ...formData, communications: value })}
      />
      <OptionGroup
        label={t('population')}
        options={population}
        value={formData?.population}
        onChange={(value) => setFormData({ ...formData, population: value })}
      />
      <OptionGroup
        label={t('economy')}
        options={economyOptions}
        value={formData?.economy}
        onChange={(value) => setFormData({ ...formData, economy: value })}
      />
      <OptionGroup
        label={t('trade-options')}
        options={tradeOptions}
        value={formData?.trade}
        onChange={(value) => setFormData({ ...formData, trade: value })}
      />
      <OptionGroup
        label={t('language-options')}
        options={languageOptions}
        value={formData?.languageOptions}
        onChange={(value) => setFormData({ ...formData, languageOptions: value })}
      />
      <OptionGroup
        label={t('item-options')}
        options={itemTypes}
        value={formData?.itemType}
        onChange={(value) => setFormData({ ...formData, itemType: value })}
      />
    </Grid>
  );
};

const OptionGroup = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <>
      <Grid size={{ xs: 12, md: 3 }}>{label}</Grid>
      <Grid size={{ xs: 12, md: 9 }}>
        <ButtonGroup aria-label={label}>
          {options.map((opt) => (
            <Button key={opt} variant={value === opt ? 'contained' : 'outlined'} onClick={() => onChange(opt)}>
              {t(opt)}
            </Button>
          ))}
        </ButtonGroup>
      </Grid>
    </>
  );
};

export default TradeViewOptions;
