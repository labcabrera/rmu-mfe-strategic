import React, { FC, useState, Dispatch, SetStateAction } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SwapVerticalCircleIcon from '@mui/icons-material/SwapVerticalCircle';
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  ListItemIcon,
  Stack,
} from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../../ErrorContext';
import { updateCarriedStatus, deleteItem } from '../../../api/character';
import { Character } from '../../../api/character.dto';
import { StrategicItem } from '../../../api/strategic-item.dto';
import { imageBaseUrl } from '../../../services/config';
import { itemFilter } from '../../../services/display';

const IMG_SIZE = 70;

const CharacterItemTable: FC<{
  character: Character;
  items: StrategicItem[];
  carried?: boolean;
  setCharacter?: Dispatch<SetStateAction<Character | undefined>>;
  onItemClick?: (item: StrategicItem) => void;
  onItemDeleted: (itemId: string) => void;
}> = ({ character, items, carried, setCharacter, onItemClick, onItemDeleted }) => {
  const { showError } = useError();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItemId, setMenuItemId] = useState<string | null>(null);

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>, itemId: string) => {
    setAnchorEl(e.currentTarget);
    setMenuItemId(itemId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuItemId(null);
  };

  const handleToggleCarried = async (itemId: string, carried: boolean) => {
    try {
      const data = await updateCarriedStatus(character.id, itemId, !carried);
      if (setCharacter) setCharacter(data);
      handleCloseMenu();
    } catch (err: any) {
      showError(err.message || err);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      const data = await deleteItem(character.id, itemId);
      if (setCharacter) setCharacter(data);
      handleCloseMenu();
    } catch (err: any) {
      showError(err.message || err);
    }
  };

  const getAmount = (item: StrategicItem): string => {
    return item.amount === 0 || (item.amount && item.amount !== 1) ? ` (${item.amount})` : '';
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table size="small" sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '10%' }}>{carried ? t('Carried') : t('Stored')}</TableCell>
            <TableCell sx={{ width: '60%' }}>{t('Name')}</TableCell>
            <TableCell sx={{ width: '10%' }}>{t('Weight')}</TableCell>
            <TableCell sx={{ width: '10%' }} align="right"></TableCell>
            <TableCell sx={{ width: '10%' }} align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items
            .filter((item) => (typeof carried === 'boolean' ? !!item.carried === carried : true))
            .map((item) => (
              <TableRow
                key={item.id}
                hover
                onClick={() => onItemClick && onItemClick(item)}
                sx={{ cursor: onItemClick ? 'pointer' : 'default' }}
              >
                <TableCell>
                  <Avatar
                    variant="square"
                    src={`${imageBaseUrl}images/items/${item.itemTypeId}.png`}
                    alt={item.name}
                    sx={{
                      width: IMG_SIZE,
                      height: IMG_SIZE,
                      filter: itemFilter,
                      padding: 1,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="column">
                    <Typography variant="body2" noWrap>
                      {item.name}
                      {getAmount(item)}
                    </Typography>
                    <Typography variant="body2" color="secondary" noWrap>
                      <em>{item.name}</em>
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{item.info?.weight ?? ''}</Typography>
                </TableCell>
                <TableCell>
                  <IconButton size="small" color="primary" onClick={() => handleToggleCarried(item.id, !!item.carried)}>
                    <SwapVerticalCircleIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenMenu(e, item.id);
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && menuItemId === item.id}
                    onClose={handleCloseMenu}
                  >
                    <MenuItem onClick={() => onItemDeleted(item.id)}>
                      <ListItemIcon>
                        <DeleteIcon fontSize="small" />
                      </ListItemIcon>
                      {t('Delete')}
                    </MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CharacterItemTable;
