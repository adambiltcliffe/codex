import neutralCardInfo from "./neutral";
import bashingCardInfo from "./bashing";
import finesseCardInfo from "./finesse";

export * from "./constants";

const cardInfo = { ...neutralCardInfo, ...bashingCardInfo, ...finesseCardInfo };

export default cardInfo;
