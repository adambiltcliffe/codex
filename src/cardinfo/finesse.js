import log from "../log";
import { types, colors, specs } from "./constants";
import cardInfo from ".";

const finesseCardInfo = {
  starcrossed_starlet: {
    color: colors.neutral,
    tech: 1,
    spec: specs.finesse,
    name: "Star-Crossed Starlet",
    type: types.unit,
    subtypes: ["Virtuoso"],
    cost: 2,
    attack: 3,
    hp: 2,
    abilities: [
      {
        triggerOnUpkeep: true,
        triggerAction: ({ state, source }) => {
          source.damage++;
          log.add(state, `${getName(state, source.id)} takes 1 damage.`);
        }
      },
      {
        modifyOwnValues: ({ state, self, values }) => {
          values.attack += state.entities[self.id].damage;
        }
      }
    ]
  },
  grounded_guide: {
    color: colors.neutral,
    tech: 2,
    spec: specs.finesse,
    name: "Grounded Guide",
    type: types.unit,
    subtypes: ["Thespian"],
    cost: 5,
    attack: 4,
    hp: 4,
    abilities: [
      {
        modifyGlobalValues: ({ state, source, subject, values }) => {
          if (source.id != subject.id) {
            if (values.subtypes.includes("Virtuoso")) {
              values.attack += 2;
              values.hp += 1;
            } else {
              values.attack += 1;
            }
          }
        }
      }
    ]
  }
};

export default finesseCardInfo;
