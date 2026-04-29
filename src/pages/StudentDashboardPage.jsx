import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";

import AppShell from "../components/AppShell";
import SidebarItem from "../components/SidebarItem";
import { shellStyles } from "../components/layoutStyles";
import { api } from "../services/api";
import { clearAuth, storeAuth } from "../services/auth";
import { getStudentImageSrc } from "../services/studentVisuals";

const developmentStudents = [
  { username: "student", password: "student123", label: "Demo Student 1" },
  { username: "student2", password: "student123", label: "Demo Student 2" },
  { username: "student3", password: "student123", label: "Demo Student 3" },
];

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(localStorage.getItem("studentDashboardPage") || "profile");
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [extras, setExtras] = useState([]);
  const [billMonth, setBillMonth] = useState(new Date().toISOString().slice(0, 7));
  const [bill, setBill] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [complaintForm, setComplaintForm] = useState({ type: "", text: "" });
  const [message, setMessage] = useState("");
  const [complaintMessage, setComplaintMessage] = useState("");
  const [switchingStudent, setSwitchingStudent] = useState("");

  useEffect(() => {
    localStorage.setItem("studentDashboardPage", page);
  }, [page]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 8000);

    return () => clearInterval(interval);
  }, [billMonth]);

  async function loadData() {
    setMessage("");
    setComplaintMessage("");

    const [studentResult, attendanceResult, extrasResult, billResult, complaintsResult] = await Promise.allSettled([
      api.getStudentProfile(),
      api.getStudentAttendance(),
      api.getMyExtras(),
      api.getMyBill(billMonth),
      api.getMyComplaints(),
    ]);

    if (studentResult.status === "fulfilled") {
      setStudent(studentResult.value);
    } else {
      setMessage(studentResult.reason.message);
    }

    if (attendanceResult.status === "fulfilled") {
      setAttendance(attendanceResult.value);
    }

    if (extrasResult.status === "fulfilled") {
      setExtras(extrasResult.value);
    }

    if (billResult.status === "fulfilled") {
      setBill(billResult.value);
    }

    if (complaintsResult.status === "fulfilled") {
      setComplaints(complaintsResult.value);
    } else {
      setComplaintMessage(complaintsResult.reason.message);
    }
  }

  useEffect(() => {
    api.getMyBill(billMonth).then(setBill).catch(() => {});
  }, [billMonth]);

  async function submitComplaint(event) {
    event.preventDefault();

    try {
      const response = await api.createComplaint(complaintForm);
      setComplaintMessage(response.message);
      setComplaintForm({ type: "", text: "" });
      setComplaints(await api.getMyComplaints());
    } catch (error) {
      setComplaintMessage(error.message);
    }
  }

  function logout() {
    clearAuth();
    navigate("/", { replace: true });
  }

  async function switchStudentAccount(username) {
    const targetStudent = developmentStudents.find((entry) => entry.username === username);
    if (!targetStudent) {
      return;
    }

    try {
      setSwitchingStudent(username);
      setMessage("");
      const response = await api.login({
        username: targetStudent.username,
        password: targetStudent.password,
      });
      storeAuth(response);
      setStudent(null);
      setAttendance([]);
      setExtras([]);
      setBill(null);
      setComplaints([]);
      await loadData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSwitchingStudent("");
    }
  }

  return (
    <AppShell portalTitle="Student Dashboard">
      <div style={{ display: "flex" }}>
        <div style={shellStyles.sidebar}>
          <div style={shellStyles.sidebarHeading}>Academic Menu</div>
          <SidebarItem title="Profile & QR" id="profile" current={page} setCurrent={setPage} />
          <SidebarItem title="Attendance History" id="attendance" current={page} setCurrent={setPage} />
          <SidebarItem title="Extra Items" id="extras" current={page} setCurrent={setPage} />
          <SidebarItem title="Monthly Bill" id="billing" current={page} setCurrent={setPage} />
          <SidebarItem title="Complaints" id="complaints" current={page} setCurrent={setPage} />
          <SidebarItem title="Logout" id="logout" current="" setCurrent={logout} />
        </div>

        <div style={shellStyles.content}>
          <StudentSwitcher
            currentStudent={student}
            switchingStudent={switchingStudent}
            switchStudentAccount={switchStudentAccount}
          />
          {message ? <p style={{ color: "#990000", marginTop: 0 }}>{message}</p> : null}
          {page === "profile" && <StudentProfile student={student} />}
          {page === "attendance" && <AttendanceHistory attendance={attendance} />}
          {page === "extras" && <ExtraItemsHistory extras={extras} />}
          {page === "billing" && <StudentBilling bill={bill} billMonth={billMonth} setBillMonth={setBillMonth} />}
          {page === "complaints" && (
            <StudentComplaints
              complaintMessage={complaintMessage}
              complaintForm={complaintForm}
              setComplaintForm={setComplaintForm}
              complaints={complaints}
              submitComplaint={submitComplaint}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}

function StudentSwitcher({ currentStudent, switchingStudent, switchStudentAccount }) {
  return (
    <div style={{ ...shellStyles.card, marginBottom: "20px", padding: "18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <h3 style={{ margin: 0, color: "#003A6A" }}>Development Student Switcher</h3>
          <p style={{ margin: "8px 0 0 0" }}>
            Current student: <b>{currentStudent?.name || currentStudent?.username || "Loading..."}</b>
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {developmentStudents.map((entry) => (
            <button
              key={entry.username}
              type="button"
              onClick={() => switchStudentAccount(entry.username)}
              disabled={switchingStudent === entry.username}
              style={{
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                background: currentStudent?.username === entry.username ? "#003A6A" : "#337ab7",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {switchingStudent === entry.username ? "Switching..." : entry.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudentProfile({ student }) {
  if (!student) {
    return <div style={shellStyles.card}>Loading student profile...</div>;
  }

  return (
    <div style={shellStyles.card}>
      <h2 style={shellStyles.title}>Personal Details Verification</h2>
      <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
        <div style={{ textAlign: "center", minWidth: "200px" }}>
          <img
            src={getStudentImageSrc(student)}
            alt="Student"
            style={{ width: "150px", height: "180px", objectFit: "cover", border: "1px solid #ccc" }}
          />
          <h3>{student.name || student.username}</h3>
          <b>{student.rollNumber || student.username}</b>
          <div style={{ marginTop: "15px", display: "inline-block", background: "white", padding: "12px" }}>
            <QRCode value={student.qrCode || student.rollNumber || student.username} size={120} />
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <table style={shellStyles.table}>
            <tbody>
              <ProfileRow label="Roll No" value={student.rollNumber || "-"} />
              <ProfileRow label="Name" value={student.name || "-"} />
              <ProfileRow label="Department" value={student.department || "-"} />
              <ProfileRow label="Hostel" value={student.hostel || "-"} />
              <ProfileRow label="Room No" value={student.roomNo || "-"} />
              <ProfileRow label="Phone" value={student.phone || "-"} />
              <ProfileRow label="QR Payload" value={student.qrCode ? "Generated and active" : "-"} />
              <ProfileRow label="Role" value={student.role || "-"} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <tr>
      <td style={{ ...shellStyles.td, fontWeight: "bold", background: "#f7f7f7", width: "200px" }}>{label}</td>
      <td style={shellStyles.td}>{value}</td>
    </tr>
  );
}

function AttendanceHistory({ attendance }) {
  const groupedAttendance = attendance.reduce((accumulator, item) => {
    if (!accumulator[item.date]) {
      accumulator[item.date] = {
        date: item.date,
        breakfast: false,
        lunch: false,
        dinner: false,
      };
    }

    if (item.mealType && item.status === "present") {
      accumulator[item.date][item.mealType] = true;
    }

    return accumulator;
  }, {});

  const rows = Object.values(groupedAttendance).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div style={shellStyles.card}>
      <h2 style={shellStyles.title}>Attendance History</h2>
      <table style={shellStyles.table}>
        <thead style={shellStyles.tableHead}>
          <tr>
            <th style={shellStyles.th}>Date</th>
            <th style={shellStyles.th}>Breakfast</th>
            <th style={shellStyles.th}>Lunch</th>
            <th style={shellStyles.th}>Dinner</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td style={shellStyles.td} colSpan="4">
                No attendance records found.
              </td>
            </tr>
          ) : (
            rows.map((item) => (
              <tr key={item.date}>
                <td style={shellStyles.td}>{item.date}</td>
                <td style={{ ...shellStyles.td, textAlign: "center", fontSize: "22px", color: item.breakfast ? "green" : "#999" }}>
                  {item.breakfast ? "✓" : "-"}
                </td>
                <td style={{ ...shellStyles.td, textAlign: "center", fontSize: "22px", color: item.lunch ? "green" : "#999" }}>
                  {item.lunch ? "✓" : "-"}
                </td>
                <td style={{ ...shellStyles.td, textAlign: "center", fontSize: "22px", color: item.dinner ? "green" : "#999" }}>
                  {item.dinner ? "✓" : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ExtraItemsHistory({ extras }) {
  return (
    <div style={shellStyles.card}>
      <h2 style={shellStyles.title}>Extra Items History</h2>
      <table style={shellStyles.table}>
        <thead style={shellStyles.tableHead}>
          <tr>
            <th style={shellStyles.th}>Date</th>
            <th style={shellStyles.th}>Time</th>
            <th style={shellStyles.th}>Item</th>
            <th style={shellStyles.th}>Qty</th>
            <th style={shellStyles.th}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {extras.length === 0 ? (
            <tr>
              <td style={shellStyles.td} colSpan="5">
                No extra items added yet.
              </td>
            </tr>
          ) : (
            extras.map((item) => (
              <tr key={item._id}>
                <td style={shellStyles.td}>{item.date}</td>
                <td style={shellStyles.td}>{item.time}</td>
                <td style={shellStyles.td}>{item.itemName}</td>
                <td style={shellStyles.td}>{item.quantity}</td>
                <td style={shellStyles.td}>Rs. {item.totalPrice}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function StudentBilling({ bill, billMonth, setBillMonth }) {
  const billRows = [
    ...(bill?.attendanceItems || []).map((item) => ({
      key: `meal-${item._id}`,
      date: item.date,
      type: item.excludedByMessOff ? "Mess Off" : "Meal",
      detail: item.excludedByMessOff ? `${item.mealType} excluded from bill` : `${item.mealType} (${item.time})`,
      amount: item.rate,
    })),
    ...(bill?.extraItems || []).map((item) => ({
      key: `extra-${item._id}`,
      date: item.date,
      type: "Extra",
      detail: `${item.itemName} x ${item.quantity}`,
      amount: item.totalPrice,
    })),
  ].sort((a, b) => `${b.date}${b.type}`.localeCompare(`${a.date}${a.type}`));

  return (
    <div style={shellStyles.card}>
      <h2 style={shellStyles.title}>Monthly Bill</h2>
      <div style={{ marginBottom: "20px" }}>
        <label style={shellStyles.label}>Billing Month</label>
        <input
          type="month"
          value={billMonth}
          onChange={(event) => setBillMonth(event.target.value)}
          style={{ ...shellStyles.input, maxWidth: "220px" }}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "15px", marginBottom: "20px" }}>
        <BillSummaryCard label="Meals Total" value={bill?.summary?.attendanceTotal || 0} />
        <BillSummaryCard label="Extras Total" value={bill?.summary?.extrasTotal || 0} />
        <BillSummaryCard label="Grand Total" value={bill?.summary?.grandTotal || 0} />
      </div>
      <table style={shellStyles.table}>
        <thead style={shellStyles.tableHead}>
          <tr>
            <th style={shellStyles.th}>Date</th>
            <th style={shellStyles.th}>Type</th>
            <th style={shellStyles.th}>Detail</th>
            <th style={shellStyles.th}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {billRows.map((entry) => (
            <tr key={entry.key}>
              <td style={shellStyles.td}>{entry.date}</td>
              <td style={shellStyles.td}>{entry.type}</td>
              <td style={shellStyles.td}>{entry.detail}</td>
              <td style={shellStyles.td}>Rs. {entry.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BillSummaryCard({ label, value }) {
  return (
    <div style={{ ...shellStyles.card, boxShadow: "none", border: "1px solid #ddd", padding: "16px" }}>
      <p style={{ margin: 0, color: "#003A6A", fontWeight: "bold" }}>{label}</p>
      <p style={{ margin: "8px 0 0 0", fontSize: "22px" }}>Rs. {value}</p>
    </div>
  );
}

function StudentComplaints({ complaintMessage, complaintForm, setComplaintForm, complaints, submitComplaint }) {
  return (
    <div style={shellStyles.card}>
      <h2 style={shellStyles.title}>Mess Complaint Portal</h2>
      {complaintMessage ? <p style={{ color: "#990000" }}>{complaintMessage}</p> : null}

      <form onSubmit={submitComplaint}>
        <label style={shellStyles.label}>Complaint Type</label>
        <select
          name="type"
          value={complaintForm.type}
          onChange={(event) => setComplaintForm({ ...complaintForm, type: event.target.value })}
          style={{ ...shellStyles.input, marginBottom: "15px" }}
        >
          <option value="">Select Issue</option>
          <option>Wrong Entry</option>
          <option>Food Quality</option>
          <option>Mess Worker Behaviour</option>
          <option>Cleanliness Issue</option>
          <option>Electrical Issue</option>
          <option>Furniture Issue</option>
          <option>Other</option>
        </select>

        <label style={shellStyles.label}>Description</label>
        <textarea
          name="text"
          rows="4"
          value={complaintForm.text}
          onChange={(event) => setComplaintForm({ ...complaintForm, text: event.target.value })}
          style={{ ...shellStyles.input, marginBottom: "15px" }}
          placeholder="Describe your issue..."
        />

        <button style={{ ...shellStyles.button, width: "220px" }}>Submit Complaint</button>
      </form>

      <h3 style={{ marginTop: "40px", color: "#003A6A" }}>Complaint History</h3>
      <table style={shellStyles.table}>
        <thead style={shellStyles.tableHead}>
          <tr>
            <th style={shellStyles.th}>Date</th>
            <th style={shellStyles.th}>Type</th>
            <th style={shellStyles.th}>Description</th>
            <th style={shellStyles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {complaints.length === 0 ? (
            <tr>
              <td style={shellStyles.td} colSpan="4">
                No complaints submitted
              </td>
            </tr>
          ) : (
            complaints.map((complaint) => (
              <tr key={complaint._id}>
                <td style={shellStyles.td}>{complaint.date}</td>
                <td style={shellStyles.td}>{complaint.type}</td>
                <td style={shellStyles.td}>{complaint.text}</td>
                <td
                  style={{
                    ...shellStyles.td,
                    color: complaint.status === "Resolved" ? "green" : "orange",
                    fontWeight: "bold",
                  }}
                >
                  {complaint.status}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
