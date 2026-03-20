import { Routes, Route } from "react-router-dom";
import IntegrationsHub from "./IntegrationsHub";
import IntegrationDetail from "./IntegrationDetail";

export default function Integrations() {
  return (
    <Routes>
      <Route index element={<IntegrationsHub />} />
      <Route path=":slug" element={<IntegrationDetail />} />
    </Routes>
  );
}
