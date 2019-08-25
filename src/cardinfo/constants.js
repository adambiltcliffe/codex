export const types = {
  unit: "UNIT",
  hero: "HERO",
  spell: "SPELL",
  building: "BUILDING",
  upgrade: "UPGRADE"
};

export const colors = {
  red: "RED",
  green: "GREEN",
  white: "WHITE",
  black: "BLACK",
  blue: "BLUE",
  purple: "PURPLE",
  neutral: "NEUTRAL"
};

export const specs = {
  anarchy: "ANARCHY",
  blood: "BLOOD",
  fire: "FIRE",
  balance: "BALANCE",
  feral: "FERAL",
  growth: "GROWTH",
  law: "LAW",
  peace: "PEACE",
  truth: "TRUTH",
  demonology: "DEMONOLOGY",
  disease: "DISEASE",
  necromancy: "NECROMANCY",
  discipline: "DISCIPLINE",
  ninjutsu: "NINJUTSU",
  strength: "STRENGTH",
  past: "PAST",
  present: "PRESENT",
  future: "FUTURE",
  bashing: "BASHING",
  finesse: "FINESSE"
};

export const specColors = {
  [specs.anarchy]: colors.red,
  [specs.blood]: colors.red,
  [specs.fire]: colors.red,
  [specs.balance]: colors.green,
  [specs.feral]: colors.green,
  [specs.growth]: colors.green,
  [specs.law]: colors.blue,
  [specs.peace]: colors.blue,
  [specs.truth]: colors.blue,
  [specs.demonology]: colors.black,
  [specs.disease]: colors.black,
  [specs.necromancy]: colors.black,
  [specs.discipline]: colors.white,
  [specs.ninjutsu]: colors.white,
  [specs.strength]: colors.white,
  [specs.past]: colors.purple,
  [specs.present]: colors.purple,
  [specs.future]: colors.purple,
  [specs.bashing]: colors.neutral,
  [specs.finesse]: colors.neutral
};

export const targetMode = {
  single: "TM_1",
  modal: "TM_MODAL",
  obliterate: "TM_OBLITERATE"
};
