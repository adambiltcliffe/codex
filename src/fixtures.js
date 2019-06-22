import { types } from "./cardinfo/constants";

export const fixtureNames = { base: "F_BASE" };

const fixtures = {
  [fixtureNames.base]: { type: types.building, name: "base", attack: 0, hp: 20 }
};

export default fixtures;
