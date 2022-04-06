import BaseLink from "./BaseLink";

export default class TemporaryLink extends BaseLink {
  constructor(canvas, src, trg, _) {
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
    this.addEvents();
  }

  /**
   * @private
   * @override
   * disable default click event
   */
  addEvents = () => {
    this.path.on("click", null);
    return this;
  };
}
