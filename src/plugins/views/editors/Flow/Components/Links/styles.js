import { LINK_DEPENDENCY } from "../../../../../../utils/Constants";
import { MOVAI_FLOW_TYPES } from "../../Constants/constants";

const ONLY_FROM = `dependency_${LINK_DEPENDENCY.ONLY_FROM.VALUE}`;
const ONLY_TO = `dependency_${LINK_DEPENDENCY.ONLY_TO.VALUE}`;
const NO_DEPENDENCIES = `dependency_${LINK_DEPENDENCY.NO_DEPENDENCIES.VALUE}`;

export const baseLinkStyles = {
  _default: {
    stroke: {
      default: "white",
      warning: "#ffc107",
      overWidth: 5,
      width: 3
    }
  },
  get [MOVAI_FLOW_TYPES.LINKS.TRANSITION]() {
    return { stroke: { ...this._default.stroke, default: "#a74165" } };
  },
  get [MOVAI_FLOW_TYPES.LINKS.NODELET]() {
    return { ...this._default };
  },
  get [ONLY_FROM]() {
    return { color: LINK_DEPENDENCY.ONLY_FROM.COLOR };
  },
  get [ONLY_TO]() {
    return { color: LINK_DEPENDENCY.ONLY_TO.COLOR };
  },
  get [NO_DEPENDENCIES]() {
    return { color: LINK_DEPENDENCY.NO_DEPENDENCIES.COLOR };
  }
};
