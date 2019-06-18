function rep(thing) {
  if (typeof thing == "object") {
    return `\$\{${thing.id}\}`;
  } else {
    return thing;
  }
}

const log = {
  clear: state => {
    state.log = [];
  },
  add: (state, text) => {
    state.log.push(text);
  },
  fmt: (fragments, ...objects) => {
    return fragments.reduce((result, string, i) => {
      return `${result}${string}${rep(objects[i]) || ""}`;
    }, "");
  }
};

export default log;
