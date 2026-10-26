import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import {
  Character,
  fetchCharacterSpells,
  formatBonus,
  KnownSpellList,
  NumericInput,
  Panel,
  ResourceBar,
  restoreCharacterPower,
  spendCharacterPower,
  SpellEffectList,
  StrategicGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useStrategicNotify } from '../../../services/notify-service';
import { canChangeCharacter } from '../../../shared/permissions';

/** Skills whose specialization is a spell list (spec 029). */
const SPELL_LIST_SKILLS = ['base-spell-list', 'open-spell-list', 'closed-spell-list', 'arcane-spell-list', 'restricted-spell-list'];

/** The character has magic: spell lists or power points (the Magic tab is shown only then). */
export const hasMagic = (character: Character): boolean =>
  !!character.power || character.skills.some((skill) => SPELL_LIST_SKILLS.includes(skill.skillId) && !!skill.specialization);

/** Magic of the character (spec 029): power points and the spells known in each list, up to its ranks. */
const CharacterMagicSection: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  strategicGame?: StrategicGame;
}> = ({ character, setCharacter, strategicGame }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useStrategicNotify();
  const [lists, setLists] = useState<KnownSpellList[]>();
  const [amount, setAmount] = useState(1);
  const canChange = canChangeCharacter(auth, character, strategicGame);
  // The known spells change with the ranks of the lists
  const listsKey = character.skills
    .filter((skill) => SPELL_LIST_SKILLS.includes(skill.skillId))
    .map((skill) => `${skill.specialization}:${skill.ranks}`)
    .join(',');

  useEffect(() => {
    fetchCharacterSpells(character.id, auth)
      .then(setLists)
      .catch((err) => {
        setLists([]);
        notify.error(err);
      });
  }, [character.id, listsKey]);

  const changePower = (change: 'spend' | 'restore') => {
    const call = change === 'spend' ? spendCharacterPower : restoreCharacterPower;
    call(character.id, amount, auth).then(setCharacter).catch(notify.error);
  };

  return (
    <Stack spacing={2}>
      <Panel title={t('power-points')}>
        {character.power ? (
          <Stack spacing={2}>
            <ResourceBar label={t('power')} current={character.power.current} max={character.power.max} kind="pp" />
            {canChange && (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
                <Box sx={{ width: 120 }}>
                  <NumericInput
                    integer
                    min={1}
                    allowNegatives={false}
                    label={t('amount')}
                    value={amount}
                    onChange={(value) => setAmount(Math.max(1, value ?? 1))}
                  />
                </Box>
                <Button variant="outlined" onClick={() => changePower('spend')} disabled={character.power.current < amount}>
                  {t('spend-power')}
                </Button>
                <Button variant="outlined" onClick={() => changePower('restore')}>
                  {t('restore-power')}
                </Button>
              </Stack>
            )}
          </Stack>
        ) : (
          <Typography color="text.secondary">{t('no-power-points')}</Typography>
        )}
      </Panel>
      <Panel title={t('spell-lists')}>
        {lists && lists.length === 0 && <Typography color="text.secondary">{t('no-spell-lists')}</Typography>}
        {lists?.map((list) => (
          <Accordion key={list.code} disableGutters variant="outlined">
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }}>{list.name ?? list.code}</Typography>
                <Chip size="small" label={t(list.skillId)} />
                <Chip size="small" variant="outlined" label={`${t('ranks')}: ${list.ranks}`} />
                <Chip size="small" variant="outlined" label={`${t('list-type-modifier')}: ${formatBonus(list.listTypeModifier)}`} />
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              {!list.spellListId && <Alert severity="warning">{t('spell-list-not-found', { code: list.code })}</Alert>}
              {list.spellListId && list.spells.length === 0 && (
                <Typography color="text.secondary">{t('no-known-spells')}</Typography>
              )}
              <Stack spacing={1}>
                {list.spells.map(({ spell, powerPoints }) => (
                  <Accordion key={spell.id} disableGutters variant="outlined">
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                        <Chip size="small" label={spell.level} />
                        <Typography noWrap>{spell.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('spell-power-points', { count: powerPoints })}
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <SpellEffectList effects={spell.effects} />
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Panel>
    </Stack>
  );
};

export default CharacterMagicSection;
