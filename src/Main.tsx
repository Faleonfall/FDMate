import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
// Self-hosted fonts (bundled by Vite, served same-origin) so type renders
// identically across Safari/Chrome/preview instead of resolving system-ui
// differently per engine. Inter for UI text, IBM Plex Mono for numbers.
import "./fonts.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import "./styles/index.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
