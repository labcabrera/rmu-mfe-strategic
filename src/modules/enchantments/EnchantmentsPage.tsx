/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useParams, useSearchParams } from 'react-router-dom';
import { Tab, Tabs } from '@mui/material';
import { EnchantmentProject, fetchEnchantments, NotFound, useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import EconomyLayout from '../economy/EconomyLayout';
import { HolderView, useHolder } from '../economy/use-holder';
import EnchantmentProjectDialog from './EnchantmentProjectDialog';
import EnchantmentProjectList from './EnchantmentProjectList';
import EnchantmentWizard from './EnchantmentWizard';

type EnchantmentsTab = 'projects' | 'new';
const TABS: EnchantmentsTab[] = ['projects', 'new'];

/** Projects of the game: the list API pages, and one page is enough for a game. */
const PROJECTS_PAGE_SIZE = 100;

/** Whether a project belongs to the page of a holder: one of its alchemists, or one of its items. */
const isOfHolder = (project: EnchantmentProject, view: HolderView): boolean => {
  const alchemists = view.holder.kind === 'character' ? [view.holder.id] : view.members.map((member) => member.id);
  return alchemists.includes(project.alchemistId) || view.items.some((item) => item.id === project.itemId);
};

/**
 * The enchantments of a character or a faction (spec 064, decision 9): its projects, and a wizard that quotes and
 * starts a new one. A project opens in a dialog with its progress, SCRs, failures and actions.
 */
export default function EnchantmentsPage() {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const { holderKind, holderId } = useParams<{ holderKind: string; holderId: string }>();
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find((value) => value === params.get('tab')) ?? 'projects') as EnchantmentsTab;
  const { view, refresh, invalid, error } = useHolder(holderKind, holderId);
  const [projects, setProjects] = useState<EnchantmentProject[]>();
  const [openId, setOpenId] = useState<string>();

  const loadProjects = useCallback(() => {
    if (!view) return;
    fetchEnchantments(`gameId==${view.gameId}`, 0, PROJECTS_PAGE_SIZE, auth)
      .then((page) => setProjects(page.content))
      .catch((e) => {
        setProjects([]);
        notify.error(e);
      });
  }, [view?.gameId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const own = useMemo(
    () => (view && projects ? projects.filter((p) => isOfHolder(p, view)) : undefined),
    [view, projects]
  );

  const setTab = (value: EnchantmentsTab) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set('tab', value);
        return next;
      },
      { replace: true }
    );

  /** A project changed: the gold of the holder and its items may have changed too. */
  const onChanged = (project?: EnchantmentProject) => {
    if (project) setProjects((list) => (list ?? []).map((other) => (other.id === project.id ? project : other)));
    loadProjects();
    refresh();
  };

  if (invalid) return <NotFound />;

  return (
    <EconomyLayout page="enchantments" view={view} error={error} onRetry={refresh}>
      {view && (
        <>
          <Tabs
            value={tab}
            onChange={(_, value: EnchantmentsTab) => setTab(value)}
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            {TABS.map((value) => (
              <Tab key={value} value={value} label={t(`enchantments-tab-${value}`)} />
            ))}
          </Tabs>
          {tab === 'projects' && (
            <EnchantmentProjectList
              projects={own}
              onOpen={(project) => setOpenId(project.id)}
              onNew={() => setTab('new')}
            />
          )}
          {tab === 'new' && (
            <EnchantmentWizard
              view={view}
              projects={projects ?? []}
              onStarted={(project) => {
                setProjects((list) => [project, ...(list ?? [])]);
                onChanged();
                setTab('projects');
                setOpenId(project.id);
              }}
            />
          )}
          {openId && (
            <EnchantmentProjectDialog
              projectId={openId}
              initial={projects?.find((project) => project.id === openId)}
              onClose={() => setOpenId(undefined)}
              onChanged={onChanged}
              onDeleted={() => {
                setOpenId(undefined);
                setProjects((list) => (list ?? []).filter((project) => project.id !== openId));
              }}
            />
          )}
        </>
      )}
    </EconomyLayout>
  );
}
