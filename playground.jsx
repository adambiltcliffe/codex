import React from "react";
import ReactDOM from "react-dom";

import CodexGame from "./src/game";

import PlaygroundApp from "@adam.biltcliffe/board-state-playground";

const examplePlayers = ["player1", "player2"];

ReactDOM.render(
  <>
    <PlaygroundApp
      gameClass={CodexGame}
      initialState={{ playerList: examplePlayers }}
      filterKeys={examplePlayers}
    />
  </>,
  document.getElementById("react-render-target")
);
