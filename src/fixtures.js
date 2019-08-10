import { types } from "./cardinfo/constants";

export const fixtureNames = {
  base: "base",
  surplus: "surplus",
  tower: "tower",
  tech1: "tech1",
  tech2: "tech2",
  tech3: "tech3"
};

const fixtures = {
  [fixtureNames.base]: {
    type: types.building,
    name: "base",
    attack: 0,
    hp: 20
  },
  [fixtureNames.surplus]: {
    type: types.building,
    name: "surplus",
    isAddOn: true,
    cost: 5,
    attack: 0,
    hp: 4
  },
  [fixtureNames.tower]: {
    type: types.building,
    name: "tower",
    isAddOn: true,
    cost: 3,
    attack: 0,
    hp: 4
  },
  [fixtureNames.tech1]: {
    type: types.building,
    name: "tech 1 building",
    freeRebuild: true,
    requiresWorkers: 6,
    cost: 1,
    attack: 0,
    hp: 5
  },
  [fixtureNames.tech2]: {
    type: types.building,
    name: "tech 2 building",
    freeRebuild: true,
    requiresWorkers: 8,
    requiresFixture: fixtureNames.tech1,
    cost: 1,
    attack: 0,
    hp: 5
  },
  [fixtureNames.tech3]: {
    type: types.building,
    name: "tech 3 building",
    freeRebuild: true,
    requiresWorkers: 10,
    requiresFixture: fixtureNames.tech2,
    cost: 1,
    attack: 0,
    hp: 5
  }
};

export default fixtures;
