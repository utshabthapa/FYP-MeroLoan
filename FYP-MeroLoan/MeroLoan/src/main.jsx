import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import React from "react";
import { Provider } from "@/components/ui/provider";
import { Theme } from "@chakra-ui/react";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider>
      <Theme appearance="light">
        <App />
      </Theme>
    </Provider>
  </React.StrictMode>
);
