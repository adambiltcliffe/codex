import redCardInfo from "./red";
import greenCardInfo from "./green";
import whiteCardInfo from "./white";
import neutralCardInfo from "./neutral";
import fireCardInfo from "./fire";
import truthCardInfo from "./truth";
import presentCardInfo from "./present";
import bashingCardInfo from "./bashing";
import finesseCardInfo from "./finesse";
import heroCardInfo from "./heroes";

export * from "./constants";

const cardInfo = {
  ...redCardInfo,
  ...greenCardInfo,
  ...whiteCardInfo,
  ...neutralCardInfo,
  ...fireCardInfo,
  ...truthCardInfo,
  ...presentCardInfo,
  ...bashingCardInfo,
  ...finesseCardInfo,
  ...heroCardInfo
};

export default cardInfo;
