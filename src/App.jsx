import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleSelectionPage from "./pages/RoleSelectionPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import WorkerDashboardPage from "./pages/WorkerDashboardPage";
import DeanDashboardPage from "./pages/DeanDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import { clearAuth, getStoredRole } from "./services/auth";

function RoleHomeRedirect() {
  const role = getStoredRole();

  if (role === "student") return <Navigate to="/student-dashboard" replace />;
  if (role === "worker") return <Navigate to="/worker-dashboard" replace />;
  if (role === "dean") return <Navigate to="/dean-dashboard" replace />;
  if (role === "superadmin") return <Navigate to="/admin-dashboard" replace />;

  return <RoleSelectionPage />;
}

function LogoutPage() {
  clearAuth();
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleHomeRedirect />} />
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker-dashboard"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <WorkerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dean-dashboard"
          element={
            <ProtectedRoute allowedRoles={["dean"]}>
              <DeanDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
