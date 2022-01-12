const EVT_NAMES = {
  LOADING: "loading",
  ADD_NODE: "addNode",
  ADD_FLOW: "addFlow",
  ADD_STATE: "addState",
  ON_MOUSE_OVER: "onMouseOver",
  ON_MOUSE_OUT: "onMouseOut",
  ON_CHG_MOUSE_OVER: "onChangeMouseOver",
  ON_TOGGLE_WARNINGS: "onToggleWarnings",
  ON_CANVAS_CTX_MENU: "onCanvasCtxMenu",
  ON_LINK_CTX_MENU: "onLinkCtxMenu",
  ON_NODE_CTX_MENU: "onNodeCtxMenu",
  ON_PORT_CTX_MENU: "onPortCtxMenu",
  ON_PORT_MOUSE_OVER: "onPortMouseOver",
  ON_LINK_ERROR_MOUSE_OVER: "onLinkErrorMouseOver"
};

const EVT_TYPES = {
  PORT: "Port",
  LINK: "Link"
};

export { EVT_NAMES, EVT_TYPES };
