import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";

import AppShell from "../components/AppShell";
import SidebarItem from "../components/SidebarItem";
import { shellStyles } from "../components/layoutStyles";
import { api } from "../services/api";
import { clearAuth } from "../services/auth";
import { getStudentImageSrc } from "../services/studentVisuals";

const initialForm = {
  username: "",
  password: "",
  role: "student",
  name: "",
  rollNumber: "",
  department: "",
  hostel: "",
  phone: "",
  roomNo: "",
  aadharNumber: "",
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(localStorage.getItem("adminDashboardPage") || "users");
  const [form, setForm] = useState(initialForm);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("adminDashboardPage", page);
  }, [page]);

  useEffect(() => {
    loadUsers();
  }, []);

  const studentUsers = useMemo(
    () => users.filter((user) => user.role === "student" && user.qrCode),
    [users]
  );

  async function loadUsers() {
    try {
      setUsers(await api.getAllUsers());
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleCreateUser(event) {
    event.preventDefault();

    try {
      const response = await api.createUser(form);
      setMessage(response.message);
      setForm(initialForm);
      await loadUsers();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleDeleteUser(id) {
    try {
      const response = await api.deleteUser(id);
      setMessage(response.message);
      await loadUsers();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleRegenerateQr(id) {
    try {
      const response = await api.regenerateQr(id);
      setMessage(response.message);
      await loadUsers();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function logout() {
    clearAuth();
    navigate("/", { replace: true });
  }

  return (
    <AppShell portalTitle="Super Admin Dashboard" navLabel="| ADMIN CONTROL PANEL |">
      <div style={{ display: "flex" }}>
        <div style={shellStyles.sidebar}>
          <div style={shellStyles.sidebarHeading}>Admin Menu</div>
          <SidebarItem title="User Management" id="users" current={page} setCurrent={setPage} />
          <SidebarItem title="QR Gallery" id="qr-gallery" current={page} setCurrent={setPage} />
          <SidebarItem title="Logout" id="logout" current="" setCurrent={logout} />
        </div>

        <div style={shellStyles.content}>
          {message ? <p style={{ color: "#990000", marginTop: 0 }}>{message}</p> : null}
          {page === "users" && <div style={shellStyles.card}>
            <h2 style={shellStyles.title}>Create User</h2>
            <form onSubmit={handleCreateUser}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <FormField label="Username" value={form.username} onChange={(value) => setForm({ ...form, username: value })} />
                <FormField label="Password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} />
                <div>
                  <label style={shellStyles.label}>Role</label>
                  <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} style={shellStyles.input}>
                    <option value="student">student</option>
                    <option value="worker">worker</option>
                    <option value="dean">dean</option>
                  </select>
                </div>
                <FormField label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
                <FormField label="Roll Number" value={form.rollNumber} onChange={(value) => setForm({ ...form, rollNumber: value })} />
                <FormField label="Department" value={form.department} onChange={(value) => setForm({ ...form, department: value })} />
                <FormField label="Hostel" value={form.hostel} onChange={(value) => setForm({ ...form, hostel: value })} />
                <FormField label="Phone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
                <FormField label="Room No" value={form.roomNo} onChange={(value) => setForm({ ...form, roomNo: value })} />
                <FormField label="Aadhar Number" value={form.aadharNumber} onChange={(value) => setForm({ ...form, aadharNumber: value })} />
              </div>

              <button style={{ ...shellStyles.button, width: "220px" }}>Create User</button>
            </form>

            <h3 style={{ marginTop: "35px", color: "#003A6A" }}>All Users</h3>
            <table style={shellStyles.table}>
              <thead style={shellStyles.tableHead}>
                <tr>
                  <th style={shellStyles.th}>Username</th>
                  <th style={shellStyles.th}>Role</th>
                  <th style={shellStyles.th}>Name</th>
                  <th style={shellStyles.th}>Roll Number</th>
                  <th style={shellStyles.th}>Department</th>
                  <th style={shellStyles.th}>QR</th>
                  <th style={shellStyles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td style={shellStyles.td}>{user.username}</td>
                    <td style={shellStyles.td}>{user.role}</td>
                    <td style={shellStyles.td}>{user.name || "-"}</td>
                    <td style={shellStyles.td}>{user.rollNumber || "-"}</td>
                    <td style={shellStyles.td}>{user.department || "-"}</td>
                    <td style={shellStyles.td}>{user.qrCode ? "Generated" : "-"}</td>
                    <td style={shellStyles.td}>
                      {user.role === "superadmin" ? (
                        "Protected"
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user._id)}
                          style={{
                            padding: "6px 12px",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            background: "#c9302c",
                            color: "white",
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}

          {page === "qr-gallery" && (
            <div style={shellStyles.card}>
              <h2 style={shellStyles.title}>Student QR Gallery</h2>
              <p style={{ marginTop: 0 }}>
                Sample students are seeded automatically. Each QR contains student identity data that the worker scanner extracts.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                {studentUsers.map((student) => (
                  <div key={student._id} style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "18px", background: "#fff" }}>
                    <img
                      src={getStudentImageSrc(student)}
                      alt={student.name}
                      style={{ width: "120px", height: "140px", objectFit: "cover", border: "1px solid #ccc", display: "block", margin: "0 auto 12px auto" }}
                    />
                    <h3 style={{ margin: "0 0 6px 0", color: "#003A6A", textAlign: "center" }}>{student.name || student.username}</h3>
                    <p style={{ margin: "0 0 4px 0", textAlign: "center" }}>{student.rollNumber}</p>
                    <p style={{ margin: "0 0 14px 0", textAlign: "center" }}>{student.department || "-"}</p>
                    <div style={{ background: "#fff", padding: "16px", display: "flex", justifyContent: "center" }}>
                      <QRCode value={student.qrCode} size={200} />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRegenerateQr(student._id)}
                      style={{ ...shellStyles.button, width: "100%" }}
                    >
                      Regenerate QR
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function FormField({ label, value, onChange }) {
  return (
    <div>
      <label style={shellStyles.label}>{label}</label>
      <input value={value} onChange={(event) => onChange(event.target.value)} style={shellStyles.input} />
    </div>
  );
}
