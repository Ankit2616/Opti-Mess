import { clearAuth, getToken } from "./auth";

const API_BASE_URL = "http://localhost:5000";

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch (_error) {
    data = {};
  }

  if (response.status === 401) {
    clearAuth();
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const api = {
  login(credentials) {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },
  getStudentProfile() {
    return request("/api/student/me");
  },
  getStudentAttendance() {
    return request("/api/attendance/my-attendance");
  },
  createComplaint(payload) {
    return request("/api/complaints", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getMyComplaints() {
    return request("/api/complaints/my");
  },
  getAllComplaints() {
    return request("/api/complaints/all");
  },
  updateComplaintStatus(id) {
    return request(`/api/complaints/${id}/status`, {
      method: "PUT",
    });
  },
  getAllUsers() {
    return request("/api/admin/all-users");
  },
  createUser(payload) {
    return request("/api/admin/create-user", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  deleteUser(id) {
    return request(`/api/admin/delete-user/${id}`, {
      method: "DELETE",
    });
  },
  regenerateQr(id) {
    return request(`/api/admin/regenerate-qr/${id}`, {
      method: "POST",
    });
  },
  markAttendance(payload) {
    return request("/api/attendance/mark-attendance", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  syncAttendance(attendance) {
    return request("/api/attendance/sync-attendance", {
      method: "POST",
      body: JSON.stringify({ attendance }),
    });
  },
  getExtrasCatalog() {
    return request("/api/extras/catalog");
  },
  addExtraCharge(payload) {
    return request("/api/extras/add", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getMyExtras() {
    return request("/api/extras/my");
  },
  getMyBill(month) {
    return request(`/api/extras/my-bill?month=${encodeURIComponent(month)}`);
  },
  getStudentBill(student, month) {
    return request(
      `/api/extras/student-bill?student=${encodeURIComponent(student)}&month=${encodeURIComponent(month)}`
    );
  },
  createMessOff(payload) {
    return request("/api/extras/mess-off", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getMessOffs(student) {
    const suffix = student ? `?student=${encodeURIComponent(student)}` : "";
    return request(`/api/extras/mess-off${suffix}`);
  },
};
