import redCardInfo from "./red";
import redHeroCardInfo from "./redheroes";
import greenCardInfo from "./green";
import whiteCardInfo from "./white";
import neutralCardInfo from "./neutral";
import neutralHeroCardInfo from "./neutralheroes";
import anarchyCardInfo from "./anarchy";
import bloodCardInfo from "./blood";
import fireCardInfo from "./fire";
import balanceCardInfo from "./balance";
import feralCardInfo from "./feral";
import truthCardInfo from "./truth";
import ninjutsuCardInfo from "./ninjutsu";
import presentCardInfo from "./present";
import bashingCardInfo from "./bashing";
import finesseCardInfo from "./finesse";

export * from "./constants";

const cardInfo = {
  ...redCardInfo,
  ...redHeroCardInfo,
  ...greenCardInfo,
  ...whiteCardInfo,
  ...neutralCardInfo,
  ...neutralHeroCardInfo,
  ...anarchyCardInfo,
  ...bloodCardInfo,
  ...fireCardInfo,
  ...balanceCardInfo,
  ...feralCardInfo,
  ...truthCardInfo,
  ...ninjutsuCardInfo,
  ...presentCardInfo,
  ...bashingCardInfo,
  ...finesseCardInfo
};

export default cardInfo;
