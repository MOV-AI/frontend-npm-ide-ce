import { LINK_DEPENDENCY } from "../../../../../../utils/Constants";

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
  get "movai_msgs/Transition"() {
    return { stroke: { ...this._default.stroke, default: "#a74165" } };
  },
  get "movai_msgs/Nodelet"() {
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
