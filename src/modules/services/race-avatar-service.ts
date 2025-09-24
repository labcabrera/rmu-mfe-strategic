const raceImageMap: Record<string, string> = {
  noldor: '/static/images/races/generic-high-elf-01.png',
  sindar: '/static/images/races/generic-grey-elf-01.png',
  silvan: '/static/images/races/generic-elf-03.png',
  elf: '/static/images/races/generic-elf-01.png',
  dúnedain: '/static/images/races/generic-high-human-01.png',
  dunedain: '/static/images/races/generic-high-human-01.png',
  numenorean: '/static/images/races/generic-dark-human-01.png',
  uruk: '/static/images/races/generic-high-orc-01.png',
  olog: '/static/images/races/generic-war-troll-01.png',
  snaga: '/static/images/races/generic-lesser-orc-01.png',
  orc: '/static/images/races/generic-orc-01.png',
  gondor: '/static/images/races/generic-human-02.png',
  rohirrim: '/static/images/races/generic-horse-human-01.png',
  easterlings: '/static/images/races/generic-east-human-01.png',
  haradrim: '/static/images/races/generic-desert-human-01.png',
  druedain: '/static/images/races/generic-wood-human-01.png',
  human: '/static/images/races/generic-human-01.png',
  troll: '/static/images/races/generic-troll-01.png',
  longbeard: '/static/images/races/generic-dwarf-01.png',
  dwarf: '/static/images/races/generic-dwarf-01.png',
  hobbit: '/static/images/races/generic-halfling-01.png',
};

const defaultImage = '/static/images/races/unknown.png';

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
