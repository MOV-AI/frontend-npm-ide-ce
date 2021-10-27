import IDEPlugin from "../IDEplugin/IDEPlugin";

export class ViewReactPlugin extends IDEPlugin {
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
export function withViewPlugin(ReactComponent) {
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
          emit={this.emit}
          on={this.on}
          onTopic={this.onTopic}
        ></ReactComponent>
      );
    }
  };
  return WithPlugin;
}
