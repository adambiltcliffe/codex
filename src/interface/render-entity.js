import { getAbilityDefinition } from "../entities";

import partition from "lodash/partition";
import sumBy from "lodash/sumBy";
import uniqBy from "lodash/uniqBy";
import upperFirst from "lodash/upperFirst";

export function makeAbilityText(entity) {
  const abilityDefs = entity.current.abilities.map(getAbilityDefinition);
  const [kw, nonKw] = partition(abilityDefs, ad => ad.renderKeyword);
  const kwString = upperFirst(
    uniqBy(kw, ad => ad.renderKeyword)
      .map(ad => {
        if (ad.renderKeywordSum) {
          const num = sumBy(
            kw.filter(ad2 => ad2.renderKeyword == ad.renderKeyword),
            "value"
          );
          return `${ad.renderKeyword} ${num}`;
        }
        return ad.renderKeyword;
      })
      .join(", ")
  );
  const lines = kwString.length > 0 ? [kwString] : [];
  return lines.concat(nonKw.map(ad => ad.text));
}
