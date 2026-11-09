import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BuildIcon from '@mui/icons-material/Build';
import CasinoOutlinedIcon from '@mui/icons-material/CasinoOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { Button, Stack } from '@mui/material';
import { Character, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { HolderTreasureButton } from '../../../economy/HolderMagicButtons';
import { holderPath } from '../../../economy/use-holder';
import { isGameMaster } from '../../../shared/permissions';

/**
 * Links of the equipment of a character to its market (buy and sell), workshop (craft and repair) and enchantments,
 * and a random treasure the game master awards to it (spec 067).
 */
export default function CharacterEquipmentButtons({
  character,
  strategicGame,
  onChanged,
}: {
  character: Character;
  strategicGame?: StrategicGame;
  onChanged: () => void;
}) {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const holder = { kind: 'character' as const, id: character.id };
  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <Button variant="outlined" startIcon={<StorefrontIcon />} onClick={() => navigate(holderPath('market', holder))}>
        {t('market')}
      </Button>
      <Button variant="outlined" startIcon={<BuildIcon />} onClick={() => navigate(holderPath('workshop', holder))}>
        {t('workshop')}
      </Button>
      <Button
        variant="outlined"
        startIcon={<AutoAwesomeIcon />}
        onClick={() => navigate(holderPath('enchantments', holder))}
      >
        {t('enchantments')}
      </Button>
      <Button
        variant="outlined"
        startIcon={<CasinoOutlinedIcon />}
        onClick={() => navigate(`/strategic/characters/treasure-tables?characterId=${character.id}`)}
      >
        {t('loot-tables-title')}
      </Button>
      {isGameMaster(auth, strategicGame) && (
        <HolderTreasureButton variant="outlined" holder={holder} gameId={character.gameId} onChanged={onChanged} />
      )}
    </Stack>
  );
}
