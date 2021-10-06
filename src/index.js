import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
// import reportWebVitals from "./reportWebVitals";

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

import { Engine, PluginManager } from "@remixproject/engine";
import { HostPlugin, ViewPlugin } from "@remixproject/engine-web";
// Host plugin display
class SidePanel extends HostPlugin {
  plugins = {};
  focused = "";
  root = undefined;
  constructor(root = document.getElementById("root")) {
    super({ name: "sidePanel" });
    this.root = root;
  }
  addView(profile, view) {
    debugger;
    this.plugins[profile.name] = view;
    // view.style.display = "none"; // view is added but not displayed
    ReactDOM.render(view, this.root);
  }
  focus(name) {
    if (this.plugins[name]) {
      // Remove focus on previous view if any
      // if (this.plugins[this.focused]) {
      //   this.plugins[this.focused].style.display = "none";
      // }
      // this.plugins[name].style.display = "block";
      this.focused = name;
    }
  }

  currentFocus() {
    return this.focused;
  }

  removeView(profile) {
    if (this.plugins[profile.name]) {
      ReactDOM.unmountComponentAtNode(this.root);
      if (this.focused === profile.name) delete this.focused;
      delete this.plugins[profile.name];
    }
  }
}

class HostedPlugin extends ViewPlugin {
  root;
  constructor() {
    // Specific the location where this plugin is hosted
    super({ name: "hosted", location: "sidePanel" });
  }
  // Render the element into the host plugin
  render() {
    debugger;
    if (!this.root) {
      this.root = (
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    }
    return this.root;
  }
}

(async () => {
  try {
    const manager = new PluginManager();
    const engine = new Engine();
    const sidePanel = new SidePanel();
    const hosted = new HostedPlugin();

    // Register both plugins
    engine.register([manager, sidePanel, hosted]);

    // Activate both plugins: ViewPlugin will automatically be added to the view
    // The order here is important
    await manager.activatePlugin(["sidePanel", "hosted"]);

    // Focus on
    sidePanel.focus("hosted");

    // Deactivate 'hosted' will remove its view from the sidepanel
    await new Promise(re =>
      setTimeout(() => manager.deactivatePlugin(["hosted"]), 2000)
    );
  } catch (error) {
    console.log("Caught error", error);
  }
})();
