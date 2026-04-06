import { Routes, Route, Navigate } from "react-router-dom";

import { lazy, Suspense } from "react";

const EvaluationsDashboard = lazy(() => import("@/pages/evaluations/EvaluationsDashboard"));
const EvaluationsCampaigns = lazy(() => import("@/pages/evaluations/EvaluationsCampaigns"));
const EvaluationsReports = lazy(() => import("@/pages/evaluations/EvaluationsReports"));
const EvaluationsSettings = lazy(() => import("@/pages/evaluations/EvaluationsSettings"));
const EvalClientes = lazy(() => import("@/pages/pdv/evaluations/EvalClientes"));
const EvalCupons = lazy(() => import("@/pages/pdv/evaluations/EvalCupons"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

export default function EvaluationsLayout() {
  return (
    <div className="flex flex-col">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route index element={<EvaluationsDashboard />} />
          <Route path="campanhas" element={<EvaluationsCampaigns />} />
          <Route path="relatorios" element={<EvaluationsReports />} />
          <Route path="clientes" element={<EvalClientes />} />
          <Route path="cupons" element={<EvalCupons />} />
          <Route path="configuracoes" element={<EvaluationsSettings />} />
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}
