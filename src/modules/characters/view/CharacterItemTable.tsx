import React, { FC, useState, Dispatch, SetStateAction } from 'react';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Avatar,
  Checkbox,
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
} from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { updateCarriedStatus, deleteItem } from '../../api/character';
import { Character } from '../../api/character.dto';

const IMG_SIZE = 48;

const CharacterItemTable: FC<{
  character: Character;
  setCharacter?: Dispatch<SetStateAction<Character>>;
}> = ({ character, setCharacter }) => {
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
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>{t('name')}</TableCell>
            <TableCell>{t('type')}</TableCell>
            <TableCell>{t('amount')}</TableCell>
            <TableCell>{t('weight')}</TableCell>
            <TableCell align="center">{t('carried')}</TableCell>
            <TableCell align="right">{t('actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {character.items.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>
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
              <TableCell>
                <Typography variant="body2">{item.name}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{t(item.itemTypeId) || ''}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{item.amount && item.amount > 1 ? item.amount : ''}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{item.info?.weight ?? ''}</Typography>
              </TableCell>
              <TableCell align="center">
                <Checkbox checked={!!item.carried} disabled />
              </TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={(e) => handleOpenMenu(e, item.id)}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl) && menuItemId === item.id} onClose={handleCloseMenu}>
                  <MenuItem onClick={() => handleToggleCarried(item.id, !!item.carried)}>
                    <ListItemIcon>
                      {item.carried ? <BlockIcon fontSize="small" /> : <AssignmentTurnedInIcon fontSize="small" />}
                    </ListItemIcon>
                    {item.carried ? t('noCarry') : t('carry')}
                  </MenuItem>
                  <MenuItem onClick={() => handleDelete(item.id)}>
                    <ListItemIcon>
                      <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    {t('delete')}
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
