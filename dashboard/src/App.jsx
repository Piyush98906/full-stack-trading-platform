import { useState } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Chart as ChartJS, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import Sidebar from './components/Sidebar';
import StockDetailModal from './components/StockDetailModal';
import Topbar from './components/Topbar';
import { AdminRoute, ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { StockDetailProvider } from './context/StockDetailContext';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardHome from './pages/DashboardHome';
import Watchlist from './pages/Watchlist';
import Holdings from './pages/Holdings';
import Positions from './pages/Positions';
import Orders from './pages/Orders';
import Funds from './pages/Funds';
import Summary from './pages/Summary';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';


ChartJS.register(...registerables);

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
      <StockDetailModal />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <StockDetailProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardHome />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/holdings" element={<Holdings />} />
                <Route path="/positions" element={<Positions />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/funds" element={<Funds />} />
                <Route path="/summary" element={<Summary />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />

                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminPanel />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </StockDetailProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
