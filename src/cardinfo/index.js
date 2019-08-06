import redCardInfo from "./red";
import greenCardInfo from "./green";
import whiteCardInfo from "./white";
import neutralCardInfo from "./neutral";
import neutralHeroCardInfo from "./neutralheroes";
import fireCardInfo from "./fire";
import fireHeroCardInfo from "./fireheroes";
import truthCardInfo from "./truth";
import ninjutsuCardInfo from "./ninjutsu";
import presentCardInfo from "./present";
import bashingCardInfo from "./bashing";
import finesseCardInfo from "./finesse";

export * from "./constants";

const cardInfo = {
  ...redCardInfo,
  ...greenCardInfo,
  ...whiteCardInfo,
  ...neutralCardInfo,
  ...neutralHeroCardInfo,
  ...fireCardInfo,
  ...fireHeroCardInfo,
  ...truthCardInfo,
  ...ninjutsuCardInfo,
  ...presentCardInfo,
  ...bashingCardInfo,
  ...finesseCardInfo
};

export default cardInfo;
