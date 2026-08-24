import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import MaintenancePage from "./MaintenancePage.tsx";
import { maintenanceMode } from "./content";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {maintenanceMode ? <MaintenancePage /> : <App />}
  </StrictMode>
);

