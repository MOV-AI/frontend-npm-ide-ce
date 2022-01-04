import * as d3 from "d3";

const STROKE_WIDTH = "2";
const COLOR = "#CDCDCD";
const FILL_CLIP_RULE = "evenodd";

/**
 * InputPort: Input port icon
 *  based on Figma icon
 */
export class InputPort {
  /**
   * getIcon: Get svg element icon
   *
   * @returns {DOMElement} svg DOM element
   */
  static getIcon = (scaleTo = "0.8") => {
    const object = containerBuilder(32, 32).attr("y", "-5");

    object
      .append("path")
      .attr("fill", COLOR)
      .attr("stroke", COLOR)
      .attr("fill-rule", FILL_CLIP_RULE)
      .attr("clip-rule", FILL_CLIP_RULE)
      .attr("transform", `scale(${scaleTo})`)
      .attr(
        "d",
        "M27.175 16C27.175 19.5613 24.288 22.4483 20.7267 22.4483C17.5187 22.4483 14.8579 20.1058 14.3615 17.038H17.9925C18.4151 18.1861 19.5187 19.005 20.8134 19.005C22.4731 19.005 23.8185 17.6596 23.8185 16C23.8185 14.3404 22.4731 12.995 20.8134 12.995C19.4902 12.995 18.3668 13.8502 17.9657 15.038H14.3496C14.8141 11.933 17.4923 9.55168 20.7267 9.55168C24.288 9.55168 27.175 12.4387 27.175 16ZM12.3325 15.038C12.81 10.8251 16.3861 7.55168 20.7267 7.55168C25.3925 7.55168 29.175 11.3341 29.175 16C29.175 20.6659 25.3925 24.4483 20.7267 24.4483C16.4122 24.4483 12.8531 21.2142 12.3415 17.038H8.66468C8.25263 18.206 7.13908 19.0431 5.83004 19.0431C4.17041 19.0431 2.825 17.6977 2.825 16.038C2.825 14.3784 4.17041 13.033 5.83004 13.033C7.13908 13.033 8.25263 13.87 8.66468 15.038H12.3325Z"
      );

    // return svg icon
    return object.node();
  };
}

/**
 * OutputPort: Input port icon
 *  based on Figma icon
 */
export class OutputPort {
  /**
   * getIcon: Get svg element icon
   *
   * @returns {DOMElement} svg DOM element
   */
  static getIcon = (scaleTo = "0.8") => {
    const object = containerBuilder(32, 32).attr("y", "-5");

    object
      .append("path")
      .attr("fill", COLOR)
      .attr("stroke", COLOR)
      .attr("fill-rule", FILL_CLIP_RULE)
      .attr("clip-rule", FILL_CLIP_RULE)
      .attr("transform", `scale(${scaleTo})`)
      .attr(
        "d",
        "M4.82501 16C4.82501 19.5613 7.71202 22.4483 11.2733 22.4483C14.4813 22.4483 17.1421 20.1058 17.6385 17.038H14.1925C13.7698 18.1861 12.6663 19.005 11.3715 19.005C9.71189 19.005 8.36649 17.6596 8.36649 16C8.36649 14.3404 9.71189 12.995 11.3715 12.995C12.6947 12.995 13.8182 13.8502 14.2193 15.038H17.6504C17.1859 11.933 14.5077 9.55168 11.2733 9.55168C7.71202 9.55168 4.82501 12.4387 4.82501 16ZM19.6675 15.038C19.19 10.8251 15.6139 7.55168 11.2733 7.55168C6.60745 7.55168 2.82501 11.3341 2.82501 16C2.82501 20.6659 6.60745 24.4483 11.2733 24.4483C15.5878 24.4483 19.1469 21.2142 19.6585 17.038H23.3353C23.7474 18.206 24.8609 19.0431 26.17 19.0431C27.8296 19.0431 29.175 17.6977 29.175 16.038C29.175 14.3784 27.8296 13.033 26.17 13.033C24.8609 13.033 23.7474 13.87 23.3353 15.038H19.6675Z"
      );

    // return svg icon
    return object.node();
  };
}

/**
 * Expanded: Expanded icon used in collapsable header
 */
export class Expanded {
  /**
   * getIcon: Get svg element icon
   *
   * @returns {DOMElement} svg DOM element
   */
  static getIcon() {
    const object = containerBuilder(22, 22);
    // Add circle
    object.append(() => {
      return circleBuilder(12, 12, 9, COLOR);
    });
    // Add path
    object
      .append("path")
      .attr("fill", "#424242")
      .attr("stroke", "#424242")
      .attr("fill-rule", FILL_CLIP_RULE)
      .attr("clip-rule", FILL_CLIP_RULE)
      .attr("d", "M16.59 8.59L12 13.17L7.41 8.59L6 10L12 16L18 10L16.59 8.59Z");
    // return svg icon
    return object.node();
  }
}

/**
 * Collapsed: Collapsed icon used in collapsable header
 */
export class Collapsed {
  /**
   * getIcon: Get svg element icon
   *
   * @returns {DOMElement} svg DOM element
   */
  static getIcon() {
    const object = containerBuilder(22, 22);
    // Add circle
    object.append(() => {
      return circleBuilder(12, 12, 9, COLOR);
    });
    // Add path
    object
      .append("path")
      .attr("fill", "#424242")
      .attr("stroke", "#424242")
      .attr("fill-rule", FILL_CLIP_RULE)
      .attr("clip-rule", FILL_CLIP_RULE)
      .attr("d", "M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12L10 6Z");
    // return svg icon
    return object.node();
  }
}

//========================================================================================
/*                                                                                      *
 *                                         Utils                                        *
 *                                                                                      */
//========================================================================================

/**
 * containerBuilder: Build svg container
 *
 * @returns {d3} d3 object
 */
const containerBuilder = (width, height) => {
  return d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("fill", "none");
};

/**
 * circleBuilder: Build svg circle
 *
 * @returns {DOMElement} svg DOM element
 */
const circleBuilder = (cx, cy, r, color) => {
  const circle = d3
    .create("svg")
    .append("circle")
    .attr("cx", cx)
    .attr("cy", cy)
    .attr("r", r)
    .attr("stroke", color)
    .attr("fill", color)
    .attr("stroke-width", STROKE_WIDTH);

  return circle.node();
};
