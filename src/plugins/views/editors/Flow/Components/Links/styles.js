export const baseLinkStyles = {
  _default: {
    stroke: {
      default: "white",
      over: "red",
      warning: "#ffc107",
      width: 3
    }
  },
  get "movai_msgs/Transition"() {
    return { stroke: { ...this._default.stroke, default: "#a74165" } };
  },
  get "movai_msgs/Nodelet"() {
    return { ...this._default };
  }
};
