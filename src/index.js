import CodexGame from "./game";
import suggestActions from "./suggest";
import * as interface from "./interface";

CodexGame.suggestActions = suggestActions;
CodexGame.interface = interface;

export default CodexGame;

import * as constants from "./cardinfo/constants";
export { constants };
