import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import { ClearableTextField } from '@labcabrera-rmu/rmu-react-shared-lib';

export default function StrategicGameListSearch({ setRsql }: { setRsql: Dispatch<SetStateAction<string>> }) {
  const { t } = useTranslation();
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    let queryString = ``;
    if (searchName) {
      queryString += `name=re=${searchName}`;
    }
    setRsql(queryString);
  }, [searchName]);

  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 3 }}>
        <ClearableTextField label={t('name')} name="name" value={searchName} onChange={(e) => setSearchName(e || '')} />
      </Grid>
    </Grid>
  );
}
