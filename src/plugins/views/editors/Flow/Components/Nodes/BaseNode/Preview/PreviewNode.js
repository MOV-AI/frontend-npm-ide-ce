import BaseNode from "../BaseNode";
import TreeNodeHeader from "../TreeView/TreeNodeHeader";
import BaseNodeStatus from "../BaseNodeStatus";

class PreviewNode extends BaseNode {
  constructor(canvas, node, events, _type, template, parent) {
    super(canvas, node, events, _type, template);
    this.parent = parent;
    this.children = new Map();
    this._links = new Map();
    this._displayPorts = false;
    this._collapsablePorts = null;
    this._belongLine = null;
  }

  //========================================================================================
  /*                                                                                      *
   *                                 Private methods                                      *
   *                                                                                      */
  //========================================================================================

  /**
   * @private
   * @override init: initialize the node element
   */
  init() {
    this.renderBody()
      .renderHeader()
      .renderStatus()

    return this;
  }

  /**
   * @override renderHeader - render the node header
   */
  renderHeader() {
    // header already exists; probably an update request;
    if (this._header) this._header.destroy();

    // create the node header instance
    this._header = new TreeNodeHeader(
      this.headerPos.x,
      this.headerPos.y,
      this.name || this.templateName,
      this.templateName,
      this._type,
      this.template.Type
    );

    // append to the svg element
    this.object.append(() => {
      return this._header.el;
    });

    return this;
  }

  /**
   * renderStatus - render the status of the node (circle on the body)
   */
  renderStatus = () => {
    const currentStatus = this.status;
    // status already exists; probably an update request;
    if (this._status) this._status.destroy();

    // create the node status instance with fixed position
    this._status = new BaseNodeStatus(37.5, 28);

    // append to the svg element
    this.object.append(() => {
      return this._status.el;
    });

    // Reset status to its original value
    this.status = currentStatus;

    return this;
  };

  //========================================================================================
  /*                                                                                      *
   *                                Getters & Setters                                     *
   *                                                                                      */
  //========================================================================================

  /**
   * @override headerPos - get the position of the header
   * @returns {object} object with the header position {x: val, y: val}
   */
  get headerPos() {
    return {
      x: this.width + this.padding.x,
      y: 0
    };
  }
}

export default PreviewNode;
