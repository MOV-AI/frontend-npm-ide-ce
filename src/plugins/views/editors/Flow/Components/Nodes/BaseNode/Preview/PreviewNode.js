import BaseNode from "../BaseNode";
import TreeNodeHeader from "../TreeView/TreeNodeHeader";

class PreviewNode extends BaseNode {
  constructor(canvas, node, events, _type, template, parent) {
    super(canvas, node, events, _type, template);
    this._template = template || this._template;
    this.parent = parent;
    this.children = new Map();
    this._links = new Map();
    this._displayPorts = false;
    this._collapsablePorts = null;
    this._belongLine = null;
    // Mount node svg
    this.init();
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
    this.renderBody().renderHeader().renderStatus();

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
