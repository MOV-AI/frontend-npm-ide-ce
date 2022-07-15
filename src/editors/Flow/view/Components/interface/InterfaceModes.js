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
    this._loading = BaseMode("loading");

    // default mode
    this._default = BaseMode("default");

    // drag mode
    this._drag = DragMode("drag");

    // add node mode
    this._addNode = AddNodeMode("addNode");

    // add flow mode
    this._addFlow = AddNodeMode("addFlow");

    // add state mode
    this._addState = AddNodeMode("addState");

    // linking mode
    this._linking = LinkingMode("linking");

    // select node mode
    this._selectNode = BaseMode("selectNode");

    // node context menu
    this._nodeCtxMenu = BaseMode("nodeCtxMenu");

    // canvas context menu
    this._canvasCtxMenu = BaseMode("canvasCtxMenu");

    // link context menu
    this._linkCtxMenu = BaseMode("linkCtxMenu");

    // port context menu
    this._portCtxMenu = BaseMode("portCtxMenu");

    // dbclick event
    this._onDblClick = BaseMode("onDblClick");

    // port mouseover/mouseout events
    this._onPortMouseOver = BaseMode("onPortMouseOver");

    // link error mouseover/mouseout events
    this._onLinkErrorMouseOver = BaseMode("onLinkErrorMouseOver");

    // toggle warnings events
    this._onToggleWarnings = BaseMode("onToggleWarnings");
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

  get loading() {
    return this._loading;
  }

  get default() {
    return this._default;
  }

  get drag() {
    return this._drag;
  }

  get addNode() {
    return this._addNode;
  }

  get addFlow() {
    return this._addFlow;
  }

  get addState() {
    return this._addState;
  }

  get linking() {
    return this._linking;
  }

  get selectNode() {
    return this._selectNode;
  }

  get nodeCtxMenu() {
    return this._nodeCtxMenu;
  }

  get canvasCtxMenu() {
    return this._canvasCtxMenu;
  }

  get linkCtxMenu() {
    return this._linkCtxMenu;
  }

  get portCtxMenu() {
    return this._portCtxMenu;
  }

  get onDblClick() {
    return this._onDblClick;
  }

  get onPortMouseOver() {
    return this._onPortMouseOver;
  }

  get onLinkErrorMouseOver() {
    return this._onLinkErrorMouseOver;
  }

  get onToggleWarnings() {
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
