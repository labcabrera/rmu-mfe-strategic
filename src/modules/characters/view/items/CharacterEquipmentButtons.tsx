import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import BuildIcon from '@mui/icons-material/Build';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { Button, Stack } from '@mui/material';
import { Character } from '@labcabrera-rmu/rmu-react-shared-lib';
import { holderPath } from '../../../economy/use-holder';

/** Links of the equipment of a character to its market (buy and sell) and its workshop (craft and repair). */
export default function CharacterEquipmentButtons({ character }: { character: Character }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const holder = { kind: 'character' as const, id: character.id };
  return (
    <Stack direction="row" spacing={1}>
      <Button variant="outlined" startIcon={<StorefrontIcon />} onClick={() => navigate(holderPath('market', holder))}>
        {t('market')}
      </Button>
      <Button variant="outlined" startIcon={<BuildIcon />} onClick={() => navigate(holderPath('workshop', holder))}>
        {t('workshop')}
      </Button>
    </Stack>
  );
}
