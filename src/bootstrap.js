import React from "react";
import ReactDOM from "react-dom";
import App from "./App/App";
import { createBrowserHistory } from "history";

const mount = el => {
  const history = createBrowserHistory();

  ReactDOM.render(<App history={history} />, el);

  return {
    onParentNavigate({ pathname: nextPathname }) {
      const { pathname } = history.location;
      console.log("nextPathName: ", nextPathname);
      if (pathname !== nextPathname) {
        history.push(nextPathname);
      }
    }
  };
};

if (process.env.NODE_ENV === "development") {
  const devRoot = document.querySelector("#root");
  if (devRoot) {
    mount(devRoot);
  }
}

export { mount };
