export const characterCreateTemplate = {
  name: 'Generic character',
  gameId: '',
  factionId: '',
  info: {
    level: 1,
    race: '',
    professionId: '',
    height: 7,
    weight: 120,
  },
  experience: {
    level: 0,
    xp: 10100,
  },
  statistics: {
    ag: {
      potential: 50,
      temporary: 50,
      racial: 0,
    },
    co: {
      potential: 50,
      temporary: 50,
      racial: 0,
    },
    em: {
      potential: 50,
      temporary: 50,
      racial: 0,
    },
    in: {
      potential: 50,
      temporary: 50,
      racial: 0,
    },
    me: {
      potential: 50,
      temporary: 50,
      racial: 0,
    },
    pr: {
      potential: 50,
      temporary: 50,
      racial: 0,
    },
    qu: {
      potential: 50,
      temporary: 50,
      racial: 0,
    },
    re: {
      potential: 50,
      temporary: 50,
      racial: 0,
    },
    sd: {
      potential: 50,
      temporary: 50,
      racial: 0,
    },
    st: {
      potential: 50,
      temporary: 50,
      racial: 0,
    },
  },
  movement: {
    strideCustomBonus: 1,
  },
  defense: {},
  endurance: {
    customBonus: 5,
  },
  power: {
    max: 0,
  },
  initiative: {
    customBonus: 1,
  },
  skills: [
    {
      skillId: 'body-development',
      ranks: 0,
    },
    {
      skillId: 'melee-weapon@blade',
      ranks: 0,
    },
    {
      skillId: 'armor-maneuver',
      ranks: 0,
    },
    {
      skillId: 'perception',
      ranks: 0,
    },
    {
      skillId: 'jumping',
      ranks: 0,
    },
    {
      skillId: 'running',
      ranks: 0,
    },
    {
      skillId: 'leadership',
      ranks: 0,
    },
    {
      skillId: 'multiple-attacks',
      ranks: 0,
    },
    {
      skillId: 'medicine',
      ranks: 0,
    },
  ],
  items: [
    {
      name: 'Basic dagger',
      itemTypeId: 'dagger',
    },
    {
      itemTypeId: 'heavy-cloth-full-suit',
    },
  ],
  description: 'Lorem ipsum',
};
