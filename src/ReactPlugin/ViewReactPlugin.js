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
    constructor(profile, props = {}) {
      super(profile);
      this.props = props;
    }
    render() {
      return (
        <ReactComponent
          {...this.props}
          call={this.call}
          profile={this.profile}
        ></ReactComponent>
      );
    }
  };
  return WithPlugin;
}
