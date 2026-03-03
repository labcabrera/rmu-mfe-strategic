import { imageBaseUrl } from './config';

const raceImageMap: Record<string, string> = {
  noldor: `${imageBaseUrl}images/races/generic-high-elf-01.png`,
  sindar: `${imageBaseUrl}images/races/generic-grey-elf-01.png`,
  silvan: `${imageBaseUrl}images/races/generic-elf-03.png`,
  elf: `${imageBaseUrl}images/races/generic-elf-01.png`,
  dúnedain: `${imageBaseUrl}images/races/generic-high-human-01.png`,
  dunedain: `${imageBaseUrl}images/races/generic-high-human-01.png`,
  numenorean: `${imageBaseUrl}images/races/generic-dark-human-01.png`,
  uruk: `${imageBaseUrl}images/races/generic-high-orc-01.png`,
  olog: `${imageBaseUrl}images/races/generic-war-troll-01.png`,
  snaga: `${imageBaseUrl}images/races/generic-lesser-orc-01.png`,
  orc: `${imageBaseUrl}images/races/generic-orc-01.png`,
  gondor: `${imageBaseUrl}images/races/generic-human-02.png`,
  rohirrim: `${imageBaseUrl}images/races/generic-horse-human-01.png`,
  easterlings: `${imageBaseUrl}images/races/generic-east-human-01.png`,
  haradrim: `${imageBaseUrl}images/races/generic-desert-human-01.png`,
  druedain: `${imageBaseUrl}images/races/generic-wood-human-01.png`,
  human: `${imageBaseUrl}images/races/generic-human-01.png`,
  troll: `${imageBaseUrl}images/races/generic-troll-01.png`,
  longbeard: `${imageBaseUrl}images/races/generic-dwarf-01.png`,
  dwarf: `${imageBaseUrl}images/races/generic-dwarf-01.png`,
  hobbit: `${imageBaseUrl}images/races/generic-halfling-01.png`,
};

const defaultImage = `${imageBaseUrl}images/races/unknown.png`;

export const resolveRaceImage = (raceName: string): string => {
  if (!raceName) {
    return defaultImage;
  }
  const check = raceName.toLowerCase();
  for (const key in raceImageMap) {
    if (check.includes(key)) {
      return raceImageMap[key];
    }
  }
  return defaultImage;
};
