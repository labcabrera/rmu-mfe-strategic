import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { AddButton } from '@labcabrera-rmu/rmu-react-shared-lib';

/** The add button of a section as a menu: create a new entity, or import it from an export file (spec 024). */
const CreateOrImportButton: FC<{ onCreate: () => void; onImport?: () => void }> = ({ onCreate, onImport }) => {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  if (!onImport) return <AddButton onClick={onCreate} />;

  const choose = (action: () => void) => {
    setAnchor(null);
    action();
  };

  return (
    <>
      <AddButton onClick={(event) => setAnchor(event.currentTarget)} />
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => choose(onCreate)}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('create')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => choose(onImport)}>
          <ListItemIcon>
            <UploadFileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('import')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default CreateOrImportButton;
