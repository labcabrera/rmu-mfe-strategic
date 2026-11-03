import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Avatar, TableSortLabel, Tooltip, Typography } from '@mui/material';
import { Character, DataTable, isCharacterSummary, resolveAssetUrl } from '@labcabrera-rmu/rmu-react-shared-lib';
import CharacterHealthChips from '../../shared/chips/CharacterHealthChips';

type SortField = 'name' | 'level' | null;
type SortDirection = 'asc' | 'desc';

const FactionViewCharactersTable: FC<{ characters: Character[] }> = ({ characters }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedCharacters = useMemo(() => {
    if (!characters) return [] as Character[];
    const list = [...characters];
    const cmp = (a: Character, b: Character) => {
      if (sortField === 'level') {
        const la = a.experience?.level ?? 0;
        const lb = b.experience?.level ?? 0;
        if (la !== lb) return la - lb;
        return (a.name || '').localeCompare(b.name || '');
      }
      // default: name
      return (a.name || '').localeCompare(b.name || '');
    };
    list.sort((a, b) => (sortDirection === 'asc' ? cmp(a, b) : -cmp(a, b)));
    return list;
  }, [characters, sortField, sortDirection]);

  const getAttackDescription = (character: Character): string => {
    if (!character.attacks || character.attacks.length === 0) return '-';
    return character.attacks
      .map((a) => `${t(a.attackTable || '')}: ${a.bo ?? ''}`.trim().replace(/ /g, '\u00a0'))
      .join('\n');
  };

  const getArmorDescription = (character: Character): string => {
    if (!character.defense || !character.defense.armor) return '-';
    if (character.defense.armor.at) return `${character.defense.armor.at}`;
    return `${character.defense.armor.headAt}/${character.defense.armor.bodyAt}/${character.defense.armor.armsAt}/${character.defense.armor.legsAt}`;
  };

  const getExperienceLabel = (c: Character): string => {
    if (c.experience.level < c.experience.availableLevel) {
      return `${c.experience.level} (${c.experience.availableLevel})`;
    }
    return `${c.experience.level}`;
  };

  // The name column stays in place while the table scrolls sideways on narrow screens.
  const stickySx = { position: 'sticky', left: 0, zIndex: 1, bgcolor: 'background.paper' } as const;

  const sortBy = (field: Exclude<SortField, null>, firstDirection: SortDirection) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(firstDirection);
    }
  };
  const abbreviation = (title: string, text: string) => (
    <Tooltip title={title}>
      <span>{text}</span>
    </Tooltip>
  );
  // Spec 071: a summary only has its name, race, profession and level.
  const full =
    (render: (c: Character) => React.ReactNode) =>
    (c: Character): React.ReactNode =>
      isCharacterSummary(c) ? '—' : render(c);
  const bonus = (value: number) => <Typography color={value < 0 ? 'error' : 'success'}>{value}</Typography>;

  return (
    <DataTable
      rows={sortedCharacters}
      getKey={(c) => c.id}
      emptyTitle={t('no-characters-have-been-created')}
      onRowClick={(c) => navigate(`/strategic/characters/view/${c.id}`, { state: { character: c } })}
      columns={[
        {
          key: 'name',
          header: (
            <TableSortLabel
              active={sortField === 'name'}
              direction={sortField === 'name' ? sortDirection : 'asc'}
              onClick={() => sortBy('name', 'asc')}
            >
              {t('name')}
            </TableSortLabel>
          ),
          cellSx: stickySx,
          render: (c) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar src={resolveAssetUrl(c.imageUrl)} alt={c.name} sx={{ width: 45, height: 45 }} variant="square" />
              <div>
                <Tooltip title={c.description || ''}>
                  <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                    {c.name}
                  </Typography>
                </Tooltip>
                {/* Compact badges: the full text on hover or tap, so the row keeps its height (spec 017). */}
                {!isCharacterSummary(c) && <CharacterHealthChips character={c} variant="compact" />}
              </div>
            </div>
          ),
        },
        { key: 'race', header: t('race'), render: (c) => c.info?.race?.name },
        {
          key: 'level',
          header: (
            <TableSortLabel
              active={sortField === 'level'}
              direction={sortField === 'level' ? sortDirection : 'asc'}
              onClick={() => sortBy('level', 'desc')}
            >
              {t('level')}
            </TableSortLabel>
          ),
          align: 'right',
          render: getExperienceLabel,
        },
        {
          key: 'hp',
          header: abbreviation(t('hp'), t('hp-short')),
          align: 'right',
          render: full((c) => (c.hp.current === c.hp.max ? c.hp.max : `${c.hp.current}/${c.hp.max}`)),
        },
        { key: 'profession', header: t('profession'), render: (c) => t(c.info?.professionId || '') },
        {
          key: 'attacks',
          header: t('attacks'),
          // One attack per line, never split inside a name or a bonus.
          cellSx: { whiteSpace: 'pre-line', minWidth: 160 },
          render: full(getAttackDescription),
        },
        {
          key: 'db',
          header: abbreviation(t('defensive-bonus'), t('db-short')),
          align: 'right',
          render: full((c) => bonus(c.defense.defensiveBonus)),
        },
        {
          key: 'at',
          header: abbreviation(t('armor-type'), t('at-short')),
          align: 'right',
          render: full(getArmorDescription),
        },
        {
          key: 'initiative',
          header: t('initiative-short'),
          align: 'right',
          render: full((c) => bonus(c.initiative.totalBonus)),
        },
        {
          key: 'bmr',
          header: abbreviation(t('base-movement-rate'), t('bmr')),
          align: 'right',
          render: full((c) => c.movement.baseMovementRate),
        },
        {
          key: 'penalty',
          header: t('penalty-short'),
          align: 'right',
          render: full((c) => bonus(c.equipment.maneuverPenalty)),
        },
      ]}
    />
  );
};

export default FactionViewCharactersTable;
