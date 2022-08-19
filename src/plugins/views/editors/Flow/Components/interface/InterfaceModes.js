import { EVT_NAMES } from "../../events";
import { BaseMode, AddNodeMode, DragMode, LinkingMode } from "./Modes";

/**
 * InterfaceModes manages the application modes (or states)
 * By default each mode as onEnter and onExit event
 * Mode events are rxjs Subjects meaning they can be easly subscribed.
 * Ex.:
 * mode.AddNode.onEnter.subscribe({
 *  next: (value)=>{}
 * })
 */

export default class InterfaceModes {
  constructor(mInterface) {
    this.mInterface = mInterface;

    this.initialize();
    this.mode = this._loading;
    this.previousMode = null;
  }

  /**
   * @private
   */
  initialize = () => {
    // loading mode
    this._loading = BaseMode(EVT_NAMES.LOADING);

    // default mode
    this._default = BaseMode(EVT_NAMES.DEFAULT);

    // drag mode
    this._drag = DragMode(EVT_NAMES.DRAG);

    // add node mode
    this._addNode = AddNodeMode(EVT_NAMES.ADD_NODE);

    // add flow mode
    this._addFlow = AddNodeMode(EVT_NAMES.ADD_FLOW);

    // add state mode
    this._addState = AddNodeMode(EVT_NAMES.ADD_STATE);

    // linking mode
    this._linking = LinkingMode(EVT_NAMES.LINKING);

    // select node mode
    this._selectNode = BaseMode(EVT_NAMES.SELECT_NODE);

    // node context menu
    this._nodeCtxMenu = BaseMode(EVT_NAMES.ON_NODE_CTX_MENU);

    // canvas context menu
    this._canvasCtxMenu = BaseMode(EVT_NAMES.ON_CANVAS_CTX_MENU);

    // link context menu
    this._linkCtxMenu = BaseMode(EVT_NAMES.ON_LINK_CTX_MENU);

    // port context menu
    this._portCtxMenu = BaseMode(EVT_NAMES.ON_PORT_CTX_MENU);

    // dbclick event
    this._onDblClick = BaseMode(EVT_NAMES.ON_DBL_CLICK);

    // port mouseover/mouseout events
    this._onPortMouseOver = BaseMode(EVT_NAMES.ON_PORT_MOUSE_OVER);

    // link error mouseover/mouseout events
    this._onLinkErrorMouseOver = BaseMode(EVT_NAMES.ON_LINK_ERROR_MOUSE_OVER);

    // toggle warnings events
    this._onToggleWarnings = BaseMode(EVT_NAMES.ON_TOGGLE_WARNINGS);
  };

  get current() {
    return this.mode;
  }

  get previous() {
    return this.previousMode;
  }

  get canvas() {
    return this.mInterface.canvas;
  }

  get graph() {
    return this.mInterface.graph;
  }

  // getters for interface modes

  get [EVT_NAMES.LOADING]() {
    return this._loading;
  }

  get [EVT_NAMES.DEFAULT]() {
    return this._default;
  }

  get [EVT_NAMES.DRAG]() {
    return this._drag;
  }

  get [EVT_NAMES.ADD_NODE]() {
    return this._addNode;
  }

  get [EVT_NAMES.ADD_FLOW]() {
    return this._addFlow;
  }

  get [EVT_NAMES.ADD_STATE]() {
    return this._addState;
  }

  get [EVT_NAMES.LINKING]() {
    return this._linking;
  }

  get [EVT_NAMES.SELECT_NODE]() {
    return this._selectNode;
  }

  get [EVT_NAMES.ON_NODE_CTX_MENU]() {
    return this._nodeCtxMenu;
  }

  get [EVT_NAMES.ON_CANVAS_CTX_MENU]() {
    return this._canvasCtxMenu;
  }

  get [EVT_NAMES.ON_LINK_CTX_MENU]() {
    return this._linkCtxMenu;
  }

  get [EVT_NAMES.ON_PORT_CTX_MENU]() {
    return this._portCtxMenu;
  }

  get [EVT_NAMES.ON_DBL_CLICK]() {
    return this._onDblClick;
  }

  get [EVT_NAMES.ON_PORT_MOUSE_OVER]() {
    return this._onPortMouseOver;
  }

  get [EVT_NAMES.ON_LINK_ERROR_MOUSE_OVER]() {
    return this._onLinkErrorMouseOver;
  }

  get [EVT_NAMES.ON_TOGGLE_WARNINGS]() {
    return this._onToggleWarnings;
  }

  /**
   * @param {string} modeId : The mode id
   * @param {any} props : The event data
   * @param {bool} force : Force mode to run onEnter/onExit
   */
  setMode = (modeId, props, force) => {
    // invalid mode
    const nextMode = this[modeId];
    if (!nextMode) throw new Error("Invalid mode", modeId);

    if (this.mode.id === modeId && !force) return;

    // trigger onExit
    this.previousMode = this.mode;
    this.previousMode.onExit.next(this.previousMode.props);

    // trigger onEnter
    this.mode = nextMode;
    nextMode.props = props;
    nextMode.onEnter.next(props);
  };

  setPrevious = () => {
    this.mode.onExit.next(this.mode.props);
    this.mode = this.previousMode;
  };
}
