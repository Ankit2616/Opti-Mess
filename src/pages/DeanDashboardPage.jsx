import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppShell from "../components/AppShell";
import SidebarItem from "../components/SidebarItem";
import { shellStyles } from "../components/layoutStyles";
import { api } from "../services/api";
import { clearAuth } from "../services/auth";

export default function DeanDashboardPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(localStorage.getItem("deanDashboardPage") || "complaints");
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    localStorage.setItem("deanDashboardPage", page);
  }, [page]);

  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    try {
      setComplaints(await api.getAllComplaints());
    } catch (_error) {
      setComplaints([]);
    }
  }

  async function toggleComplaint(id) {
    await api.updateComplaintStatus(id);
    await loadComplaints();
  }

  function logout() {
    clearAuth();
    navigate("/", { replace: true });
  }

  return (
    <AppShell portalTitle="Dean Dashboard" navLabel="| DEAN REVIEW PANEL |">
      <div style={{ display: "flex" }}>
        <div style={shellStyles.sidebar}>
          <div style={shellStyles.sidebarHeading}>Dean Menu</div>
          <SidebarItem title="Complaint Review" id="complaints" current={page} setCurrent={setPage} />
          <SidebarItem title="Logout" id="logout" current="" setCurrent={logout} />
        </div>

        <div style={shellStyles.content}>
          <div style={shellStyles.card}>
            <h2 style={shellStyles.title}>Student Complaints</h2>
            <table style={shellStyles.table}>
              <thead style={shellStyles.tableHead}>
                <tr>
                  <th style={shellStyles.th}>Date</th>
                  <th style={shellStyles.th}>Roll</th>
                  <th style={shellStyles.th}>Name</th>
                  <th style={shellStyles.th}>Type</th>
                  <th style={shellStyles.th}>Issue</th>
                  <th style={shellStyles.th}>Status</th>
                  <th style={shellStyles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr>
                    <td style={shellStyles.td} colSpan="7">
                      No complaints found.
                    </td>
                  </tr>
                ) : (
                  complaints.map((complaint) => (
                    <tr key={complaint._id}>
                      <td style={shellStyles.td}>{complaint.date}</td>
                      <td style={shellStyles.td}>{complaint.roll}</td>
                      <td style={shellStyles.td}>{complaint.studentName}</td>
                      <td style={shellStyles.td}>{complaint.type}</td>
                      <td style={shellStyles.td}>{complaint.text}</td>
                      <td style={shellStyles.td}>{complaint.status}</td>
                      <td style={shellStyles.td}>
                        <button
                          type="button"
                          onClick={() => toggleComplaint(complaint._id)}
                          style={{
                            padding: "6px 12px",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            background: complaint.status === "Resolved" ? "#f0ad4e" : "#5cb85c",
                            color: "white",
                          }}
                        >
                          {complaint.status === "Resolved" ? "Mark Pending" : "Mark Resolved"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
