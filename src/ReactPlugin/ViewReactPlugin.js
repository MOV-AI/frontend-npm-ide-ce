import { Plugin } from "@remixproject/engine";

export class ViewReactPlugin extends Plugin {
  /**
   *
   * @returns {React Component}
   */
  render() {
    // Abstract method should be implemented in subclasses
  }

  async activate() {
    await this.call(
      this.profile.location,
      "addView",
      this.profile,
      this.render()
    );
    super.activate();
  }

  deactivate() {
    this.call(this.profile.location, "removeView", this.profile);
    super.deactivate();
  }
}

/**
 *
 * @param {ReactComponent} ReactComponent
 * @returns {ViewReactPlugin}
 */
export function withPlugin(ReactComponent) {
  const WithPlugin = class extends ViewReactPlugin {
    render() {
      return ReactComponent({ call: this.call, profile: this.profile });
    }
  };
  return WithPlugin;
}
