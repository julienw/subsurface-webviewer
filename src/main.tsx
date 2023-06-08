import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import { AppLocalizationProvider } from "./AppLocalizationProvider";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppLocalizationProvider>
        <App />
      </AppLocalizationProvider>
    </Provider>
  </React.StrictMode>
);
