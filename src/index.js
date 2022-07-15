import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App/App";
import reportWebVitals from "./reportWebVitals";
// Import shared classes to be exported
import BaseApp, { installEditor, installTool } from "./App/BaseApp";
import { Store, DBSubscriber } from "./store";
import { Model, Manager } from "./models";
import { withAlerts, withTheme, withKeyBinds } from "./decorators";
import { withEditorPlugin, withViewPlugin } from "./engine";
import { setLogo, setLinks, setName, setShortcuts } from "./App/AppSettings";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Export classes to build App
export { BaseApp, installEditor, installTool };
export { Store, DBSubscriber };
export { Model, Manager };
export { withAlerts, withTheme, withKeyBinds };
export { withEditorPlugin, withViewPlugin };
export { setLogo, setLinks, setName, setShortcuts };
