import { Navigate } from "react-router-dom";

import { getStoredRole, isAuthenticated } from "../services/auth";

export default function ProtectedRoute({ allowedRoles, children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const role = getStoredRole();
  // if (!allowedRoles.includes(role)) {
  //   return <Navigate to="/" replace />;
  // }
  if (!allowedRoles.includes(role) && role !== "superadmin") {
  return <Navigate to="/" replace />;
}

  return children;
}
