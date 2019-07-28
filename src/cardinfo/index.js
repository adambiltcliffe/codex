import neutralCardInfo from "./neutral";
import greenCardInfo from "./green";
import whiteCardInfo from "./white";
import bashingCardInfo from "./bashing";
import finesseCardInfo from "./finesse";
import truthCardInfo from "./truth";

export * from "./constants";

const cardInfo = {
  ...neutralCardInfo,
  ...greenCardInfo,
  ...whiteCardInfo,
  ...bashingCardInfo,
  ...finesseCardInfo,
  ...truthCardInfo
};

export default cardInfo;
