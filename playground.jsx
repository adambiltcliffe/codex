import React from "react";
import ReactDOM from "react-dom";

import CodexGame from "./codex";

import PlaygroundApp from "@adam.biltcliffe/board-state-playground";

ReactDOM.render(
  <>
    <PlaygroundApp gameClass={CodexGame} initialState={{}}/>
  </>,
  document.getElementById("react-render-target")
);
