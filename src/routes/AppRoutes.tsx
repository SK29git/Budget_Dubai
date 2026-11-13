import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';

// Optimized Lazy Loaded Page Components
const RentalsPage = lazy(() =>
  import('../pages/RentalsPage').then((m) => ({ default: m.RentalsPage }))
);
const ReservationsPage = lazy(() =>
  import('../pages/ReservationsPage').then((m) => ({ default: m.ReservationsPage }))
);
const BillingPage = lazy(() =>
  import('../pages/BillingPage').then((m) => ({ default: m.BillingPage }))
);
const OperationsPage = lazy(() =>
  import('../pages/OperationsPage').then((m) => ({ default: m.OperationsPage }))
);
const CasesPage = lazy(() =>
  import('../pages/CasesPage').then((m) => ({ default: m.CasesPage }))
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {/* Default route redirects to rentals */}
        <Route index element={<Navigate to="/rentals" replace />} />
        <Route path="rentals" element={<RentalsPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="operations" element={<OperationsPage />} />
        <Route path="cases" element={<CasesPage />} />
        {/* Catch-all redirect to rentals to avoid 404 on refresh */}
        <Route path="*" element={<Navigate to="/rentals" replace />} />
      </Route>
    </Routes>
  );
};
