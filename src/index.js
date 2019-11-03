import CodexGame from "./game";
import suggestActions from "./suggest";
import * as iface from "./interface";

CodexGame.suggestActions = suggestActions;
CodexGame.interface = iface;

export default CodexGame;

import * as constants from "./cardinfo/constants";
export { constants };

export { TestGame } from "./testutil";
