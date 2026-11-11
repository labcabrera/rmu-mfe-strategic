import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { NotFound } from '@labcabrera-rmu/rmu-react-shared-lib';
import CraftWizard from './CraftWizard';
import EconomyLayout from './EconomyLayout';
import RepairList from './RepairList';
import { useHolder } from './use-holder';

type WorkshopTab = 'craft' | 'repair';
const TABS: WorkshopTab[] = ['craft', 'repair'];

/** The workshop of a character or a faction (spec 023, decisions 10 and 11): craft an item, or repair one. */
export default function WorkshopPage() {
  const { t } = useTranslation();
  const { holderKind, holderId } = useParams<{ holderKind: string; holderId: string }>();
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find((value) => value === params.get('tab')) ?? 'craft') as WorkshopTab;
  const { view, refresh, invalid, error } = useHolder(holderKind, holderId);

  if (invalid) return <NotFound />;

  return (
    <EconomyLayout
      page="workshop"
      view={view}
      error={error}
      onRetry={refresh}
      tabs={{
        sections: TABS.map((value) => ({ id: value, label: t(`workshop-tab-${value}`) })),
        value: tab,
        // Merge into the query, which also holds the filters of the catalog (spec 056, B-04)
        onChange: (value) =>
          setParams(
            (current) => {
              const next = new URLSearchParams(current);
              next.set('tab', value);
              return next;
            },
            { replace: true }
          ),
      }}
    >
      {view && (
        <>
          {tab === 'craft' && <CraftWizard view={view} onDone={refresh} />}
          {tab === 'repair' && <RepairList view={view} onDone={refresh} />}
        </>
      )}
    </EconomyLayout>
  );
}
