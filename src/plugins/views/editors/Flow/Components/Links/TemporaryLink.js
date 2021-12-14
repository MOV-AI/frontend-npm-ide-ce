import BaseLink from "./BaseLink";

export default class TemporaryLink extends BaseLink {
  constructor(canvas, src, trg, data) {
    const _data = {
      id: "",
      sourceNode: "",
      sourcePort: "",
      targetNode: "",
      targetPort: "",
      dependency: ""
    };
    super(canvas, src, trg, _data);
    this.path.attr("stroke-dasharray", "3,3");
    this._addEvents();
  }

  /**
   * disable default click event
   */
  _addEvents = () => {
    this.path.on("click", null);
    return this;
  };
}
