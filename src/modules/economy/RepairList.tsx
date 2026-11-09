import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ItemInventory, StrategicItem } from '@labcabrera-rmu/rmu-react-shared-lib';
import { isRepairable } from './HolderInventory';
import { RepairItemDialog } from './ItemOperationDialogs';
import { HolderView } from './use-holder';

/** The damaged items of the holder, each one with its repair dialog. */
const RepairList: FC<{ view: HolderView; onDone: () => void }> = ({ view, onDone }) => {
  const { t } = useTranslation();
  const [item, setItem] = useState<StrategicItem>();
  const damaged = view.items.filter(isRepairable);
  return (
    <>
      <ItemInventory
        items={damaged}
        emptyTitle={t('repair-nothing')}
        onSelect={setItem}
        actions={() => [{ key: 'repair', label: t('repair'), onClick: setItem }]}
      />
      {item && (
        <RepairItemDialog
          item={item}
          view={view}
          onClose={() => setItem(undefined)}
          onDone={() => {
            setItem(undefined);
            onDone();
          }}
        />
      )}
    </>
  );
};

export default RepairList;
