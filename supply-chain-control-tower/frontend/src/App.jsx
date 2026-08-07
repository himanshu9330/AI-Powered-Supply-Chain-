import React, { Suspense, lazy, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { getAppTheme } from './theme/theme';
import { useThemeStore } from './store/useAuthStore';
import { MainLayout, ProtectedRoute } from './components/layout/MainLayout';

// ── Lazy-loaded Pages ──────────────────────────────────────────────
const Login            = lazy(() => import('./pages/auth/Login').then((m) => ({ default: m.Login })));
const Register         = lazy(() => import('./pages/auth/Register').then((m) => ({ default: m.Register })));
const ForgotPassword   = lazy(() => import('./pages/auth/Register').then((m) => ({ default: m.ForgotPassword })));

const ExecutiveDashboard   = lazy(() => import('./pages/dashboard/ExecutiveDashboard').then((m) => ({ default: m.ExecutiveDashboard })));
const ProductList          = lazy(() => import('./pages/products/ProductList').then((m) => ({ default: m.ProductList })));
const InventoryList        = lazy(() => import('./pages/inventory/InventoryList').then((m) => ({ default: m.InventoryList })));
const WarehouseList        = lazy(() => import('./pages/warehouses/WarehouseList').then((m) => ({ default: m.WarehouseList })));
const SupplierList         = lazy(() => import('./pages/suppliers/SupplierList').then((m) => ({ default: m.SupplierList })));
const PurchaseOrderList    = lazy(() => import('./pages/purchase-orders/PurchaseOrderList').then((m) => ({ default: m.PurchaseOrderList })));
const SalesList            = lazy(() => import('./pages/sales/SalesList').then((m) => ({ default: m.SalesList })));
const TransferList         = lazy(() => import('./pages/transfers/TransferList').then((m) => ({ default: m.TransferList })));
const ForecastDashboard    = lazy(() => import('./pages/forecast/ForecastDashboard').then((m) => ({ default: m.ForecastDashboard })));
const AnalyticsDashboard   = lazy(() => import('./pages/analytics/AnalyticsDashboard').then((m) => ({ default: m.AnalyticsDashboard })));
const OptimizationDashboard= lazy(() => import('./pages/optimization/OptimizationDashboard').then((m) => ({ default: m.OptimizationDashboard })));
const ReportsDashboard     = lazy(() => import('./pages/reports/ReportsDashboard').then((m) => ({ default: m.ReportsDashboard })));
const NotificationsCenter  = lazy(() => import('./pages/notifications/NotificationsCenter').then((m) => ({ default: m.NotificationsCenter })));
const SettingsPage         = lazy(() => import('./pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));

// ── Global Loading Fallback ────────────────────────────────────────
const PageLoading = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      width: '100%',
    }}
  >
    <CircularProgress size={40} thickness={3} />
  </Box>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export function App() {
  const { mode } = useThemeStore();
  const theme = useMemo(() => getAppTheme(mode), [mode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              {/* ── Public Routes ──────────────────────────── */}
              <Route path="/login"           element={<Login />} />
              <Route path="/register"        element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* ── Protected App Shell ────────────────────── */}
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard"       element={<ExecutiveDashboard />} />
                <Route path="/products"        element={<ProductList />} />
                <Route path="/categories"      element={<ProductList />} />
                <Route path="/inventory"       element={<InventoryList />} />
                <Route path="/warehouses"      element={<WarehouseList />} />
                <Route path="/suppliers"       element={<SupplierList />} />
                <Route path="/purchase-orders" element={<PurchaseOrderList />} />
                <Route path="/sales"           element={<SalesList />} />
                <Route path="/transfers"       element={<TransferList />} />
                <Route path="/forecast"        element={<ForecastDashboard />} />
                <Route path="/analytics"       element={<AnalyticsDashboard />} />
                <Route path="/optimization"    element={<OptimizationDashboard />} />
                <Route path="/reports"         element={<ReportsDashboard />} />
                <Route path="/notifications"   element={<NotificationsCenter />} />
                <Route path="/settings"        element={<SettingsPage />} />
              </Route>

              {/* ── Fallback ───────────────────────────────── */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
