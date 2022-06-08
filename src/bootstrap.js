import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App/App";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

const mount = el => {
  ReactDOM.render(
    <React.StrictMode>
      <div>teste</div>
    </React.StrictMode>,
    el
  );
  return {
    onParentNavigate({ pathname: nextPathname }) {
      //   const { pathname } = history.location;
      //   if (pathname !== nextPathname) {
      //     history.push(nextPathname);
      //   }
    }
  };
};

if (process.env.NODE_ENV === "development") {
  const devRoot = document.querySelector("#ide-ce");
  if (devRoot) {
    mount(devRoot);
  }
}

export { mount };

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
