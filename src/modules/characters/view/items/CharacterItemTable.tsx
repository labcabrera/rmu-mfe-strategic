import React, { FC, useState, Dispatch, SetStateAction } from 'react';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
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
  Icon,
} from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../../ErrorContext';
import { updateCarriedStatus, deleteItem } from '../../../api/character';
import { Character, CharacterItem } from '../../../api/character.dto';
import AddButton from '../../../shared/buttons/AddButton';

const IMG_SIZE = 60;

const CharacterItemTable: FC<{
  character: Character;
  setCharacter?: Dispatch<SetStateAction<Character>>;
  carried?: boolean;
  onItemClick?: (item: CharacterItem) => void;
  onButtonAddClick?: () => void;
}> = ({ character, setCharacter, carried, onItemClick, onButtonAddClick }) => {
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

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table size="small" sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '72px' }}>{carried ? t('Carried') : t('Stored')}</TableCell>
            <TableCell sx={{ width: '240px' }}>{t('name')}</TableCell>
            <TableCell sx={{ width: '140px' }}>{t('type')}</TableCell>
            <TableCell sx={{ width: '80px' }}>{t('amount')}</TableCell>
            <TableCell sx={{ width: '80px' }}>{t('weight')}</TableCell>
            <TableCell sx={{ width: '80px' }}></TableCell>
            <TableCell align="right" sx={{ width: '80px' }}>
              <AddButton onClick={() => onButtonAddClick && onButtonAddClick()} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {character.items
            .filter((item) => (typeof carried === 'boolean' ? !!item.carried === carried : true))
            .map((item) => (
              <TableRow
                key={item.id}
                hover
                onClick={() => onItemClick && onItemClick(item)}
                sx={{ cursor: onItemClick ? 'pointer' : 'default' }}
              >
                <TableCell sx={{ width: '72px' }}>
                  <Avatar
                    variant="square"
                    src={`/static/images/items/${item.itemTypeId}.png`}
                    alt={item.name}
                    sx={{
                      width: IMG_SIZE,
                      height: IMG_SIZE,
                      filter: !!item.carried ? 'none' : 'grayscale(100%)',
                    }}
                  />
                </TableCell>
                <TableCell sx={{ width: '240px' }}>
                  <Typography variant="body2" noWrap>
                    {item.name}
                  </Typography>
                </TableCell>
                <TableCell sx={{ width: '140px' }}>
                  <Typography variant="body2" noWrap>
                    {t(item.itemTypeId) || ''}
                  </Typography>
                </TableCell>
                <TableCell sx={{ width: '80px' }}>
                  <Typography variant="body2">{item.amount && item.amount > 1 ? item.amount : ''}</Typography>
                </TableCell>
                <TableCell sx={{ width: '80px' }}>
                  <Typography variant="body2">{item.info?.weight ?? ''}</Typography>
                </TableCell>
                <TableCell sx={{ width: '80px' }}>
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
                    <MenuItem onClick={() => handleDelete(item.id)}>
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
