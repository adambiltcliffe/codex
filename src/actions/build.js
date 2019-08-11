import fixtures from "../fixtures";
import { getAP } from "../util";
import log from "../log";
import { killEntity } from "../entities";

import some from "lodash/some";

export function checkBuildAction(state, action) {
  const fixture = fixtures[action.fixture];
  if (typeof fixture != "object") {
    throw new Error("Invalid fixture name.");
  }
  const ap = getAP(state);
  if (
    fixture.cost > ap.gold &&
    !(fixture.freeRebuild && ap.paidFixtures[action.fixture])
  ) {
    throw new Error("Not enough gold.");
  }
  if (ap.current.fixtures[action.fixture]) {
    throw new Error("Already built.");
  }
  if (state.constructing.includes(action.fixture)) {
    throw new Error("Already under construction.");
  }
  if (fixture.requiresWorkers && ap.workers < fixture.requiresWorkers) {
    throw new Error("Not enough workers.");
  }
  if (
    fixture.requiresFixture &&
    !ap.current.fixtures[fixture.requiresFixture]
  ) {
    throw new Error("Previous tech building required first.");
  }
  if (fixture.isAddOn) {
    if (some(state.constructing, fn => fixtures[fn].isAddOn)) {
      throw new Error("Already constructing an add-on.");
    }
  }
}

export function doBuildAction(state, action) {
  const fixture = fixtures[action.fixture];
  const ap = getAP(state);
  state.constructing.push(action.fixture);
  let paid = false;
  if (!fixture.freeRebuild || !ap.paidFixtures.includes(action.fixture)) {
    ap.gold -= fixture.cost;
    paid = true;
  }
  if (fixture.freeRebuild && !ap.paidFixtures.includes(action.fixture)) {
    ap.paidFixtures.push(action.fixture);
  }
  if (fixture.isAddOn && ap.current.addOn !== undefined) {
    killEntity(state, ap.current.addOn);
  }
  log.add(
    state,
    log.fmt`${ap} begins ${paid ? "" : "re"}construction of ${fixture.name}.`
  );
}
