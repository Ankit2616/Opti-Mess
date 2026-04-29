import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppShell from "../components/AppShell";
import SidebarItem from "../components/SidebarItem";
import { shellStyles } from "../components/layoutStyles";
import { api } from "../services/api";
import { clearAuth } from "../services/auth";
import { getStudentImageSrc } from "../services/studentVisuals";
import { fallbackExtraItemsCatalog } from "../services/extraItemsCatalog";

const OFFLINE_KEY = "offlineAttendanceQueue";

function readOfflineQueue() {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]");
  } catch (_error) {
    return [];
  }
}

function writeOfflineQueue(queue) {
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(queue));
}

export default function WorkerDashboardPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const lastScanRef = useRef({ text: "", at: 0 });
  const isProcessingScanRef = useRef(false);

  const [page, setPage] = useState(localStorage.getItem("workerDashboardPage") || "scanner");
  const [scannerMessage, setScannerMessage] = useState("");
  const [manualQr, setManualQr] = useState("");
  const [scannedPayload, setScannedPayload] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);
  const [offlineQueue, setOfflineQueue] = useState(readOfflineQueue());
  const [cameraActive, setCameraActive] = useState(false);
  const [catalog, setCatalog] = useState(fallbackExtraItemsCatalog);
  const [selectedItemCode, setSelectedItemCode] = useState(fallbackExtraItemsCatalog[0]?.code || "");
  const [extraQuantity, setExtraQuantity] = useState(1);
  const [extraMessage, setExtraMessage] = useState("");
  const [lastExtraCharge, setLastExtraCharge] = useState(null);
  const [billMonth, setBillMonth] = useState(new Date().toISOString().slice(0, 7));
  const [billSearch, setBillSearch] = useState("DEV-STUDENT-001");
  const [studentBill, setStudentBill] = useState(null);
  const [messOffForm, setMessOffForm] = useState({
    student: "DEV-STUDENT-001",
    fromDate: new Date().toISOString().slice(0, 10),
    toDate: new Date().toISOString().slice(0, 10),
    mealType: "all",
  });
  const [messOffMessage, setMessOffMessage] = useState("");
  const [messOffList, setMessOffList] = useState([]);

  const selectedExtraItem = catalog.find((item) => item.code === selectedItemCode);

  useEffect(() => {
    localStorage.setItem("workerDashboardPage", page);
  }, [page]);

  useEffect(() => {
    api.getExtrasCatalog().then((data) => {
      const nextItems = data.items?.length ? data.items : fallbackExtraItemsCatalog;
      setCatalog(nextItems);
      if (!selectedItemCode && nextItems.length) {
        setSelectedItemCode(nextItems[0].code);
      }
    }).catch(() => {
      setCatalog(fallbackExtraItemsCatalog);
      if (!selectedItemCode && fallbackExtraItemsCatalog.length) {
        setSelectedItemCode(fallbackExtraItemsCatalog[0].code);
      }
      setExtraMessage("Showing built-in extra items list. Backend catalog fetch was unavailable.");
    });
  }, []);

  useEffect(() => {
    function handleOnline() {
      syncPendingAttendance();
    }

    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
      stopCamera();
    };
  }, [offlineQueue]);

  useEffect(() => {
    if (page === "mess-off") {
      loadMessOffs();
    }
  }, [page]);

  const pendingCount = useMemo(() => offlineQueue.length, [offlineQueue]);

  function logout() {
    clearAuth();
    navigate("/", { replace: true });
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
      }
      setCameraActive(true);
      setScannerMessage(page === "extras" ? "Continuous scanner started for extra items." : "Continuous scanner started for attendance.");
      startContinuousScan();
    } catch (_error) {
      setScannerMessage("Camera access failed. Use manual QR input.");
    }
  }

  function stopCamera() {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }

  async function scanCurrentFrame() {
    if (!videoRef.current) {
      setScannerMessage("Camera preview is not ready.");
      return;
    }

    if (!("BarcodeDetector" in window)) {
      setScannerMessage("BarcodeDetector not supported here. Use manual QR text or upload a QR image.");
      return;
    }

    if (isProcessingScanRef.current) {
      return;
    }

    try {
      isProcessingScanRef.current = true;
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const videoElement = videoRef.current;
      const canvasElement = canvasRef.current;

      if (!canvasElement || !videoElement.videoWidth || !videoElement.videoHeight) {
        return;
      }

      const context = canvasElement.getContext("2d", { willReadFrequently: true });
      if (!context) {
        return;
      }

      // Read from a concrete video frame on canvas for better browser compatibility.
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

      const codes = await detector.detect(canvasElement);
      if (!codes.length) {
        return;
      }

      const rawValue = codes[0].rawValue;
      const now = Date.now();
      if (lastScanRef.current.text === rawValue && now - lastScanRef.current.at < 4000) {
        return;
      }

      lastScanRef.current = {
        text: rawValue,
        at: now,
      };

      if (page === "extras") {
        await parseQrText(rawValue, { autoAddExtra: true });
      } else {
        await parseQrText(rawValue, { autoMark: true });
      }
    } catch (_error) {
      setScannerMessage("Unable to read QR from camera feed.");
    } finally {
      isProcessingScanRef.current = false;
    }
  }

  function startContinuousScan() {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(() => {
      scanCurrentFrame();
    }, 500);
  }

  async function parseQrText(text, { autoMark = false, autoAddExtra = false } = {}) {
    try {
      const payload = JSON.parse(text);
      setManualQr(text);
      setScannedPayload(payload);
      setScannerMessage("QR decoded successfully.");
      if (autoMark) {
        await markAttendance(text, payload);
      }
      if (autoAddExtra) {
        await addExtraCharge(text, payload);
      }
    } catch (_error) {
      setScannerMessage("QR data is not valid JSON.");
    }
  }

  async function extractQrFromImageFile(file, { autoMark = false, autoAddExtra = false } = {}) {
    if (!file) {
      return;
    }

    if (!("BarcodeDetector" in window)) {
      setScannerMessage("QR image upload needs BarcodeDetector support in this browser.");
      return;
    }

    try {
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const imageBitmap = await createImageBitmap(file);
      const codes = await detector.detect(imageBitmap);

      if (!codes.length) {
        setScannerMessage("No QR code detected in the uploaded image.");
        return;
      }

      await parseQrText(codes[0].rawValue, { autoMark, autoAddExtra });
    } catch (_error) {
      setScannerMessage("Unable to read the uploaded QR image.");
    }
  }

  async function markAttendance(qrOverride, payloadOverride) {
    const qrText = qrOverride || manualQr;

    if (!qrText) {
      setScannerMessage("Scan or paste QR data first.");
      return;
    }

    try {
      const response = await api.markAttendance({ qrData: qrText });
      setLastResponse(response);
      setScannedPayload(response.student || payloadOverride);
      setScannerMessage(response.message);
    } catch (error) {
      const offlineEntry = {
        id: `${Date.now()}`,
        qrData: qrText,
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toLocaleTimeString("en-IN", { hour12: false }),
        status: "present",
      };

      const nextQueue = [...offlineQueue, offlineEntry];
      writeOfflineQueue(nextQueue);
      setOfflineQueue(nextQueue);
      setScannerMessage(`Offline saved locally. ${error.message}`);
    }
  }

  async function addExtraCharge(qrOverride, payloadOverride) {
    const qrText = qrOverride || manualQr;
    if (!qrText || !selectedItemCode) {
      setExtraMessage("Select an extra item and scan a student QR first.");
      return;
    }

    try {
      const response = await api.addExtraCharge({
        qrData: qrText,
        itemCode: selectedItemCode,
        quantity: extraQuantity,
      });
      setScannedPayload(response.student || payloadOverride);
      setLastExtraCharge(response.extraCharge);
      setExtraMessage(response.message);
    } catch (error) {
      setExtraMessage(error.message);
    }
  }

  async function syncPendingAttendance() {
    if (!offlineQueue.length) {
      setScannerMessage("No pending offline attendance to sync.");
      return;
    }

    try {
      const response = await api.syncAttendance(offlineQueue);
      const failedEntries = response.results
        .map((result, index) => ({ result, original: offlineQueue[index] }))
        .filter(({ result }) => !result.synced)
        .map(({ original }) => original);

      writeOfflineQueue(failedEntries);
      setOfflineQueue(failedEntries);
      setLastResponse(response);
      setScannerMessage("Offline attendance sync completed.");
    } catch (error) {
      setScannerMessage(error.message);
    }
  }

  async function searchStudentBill() {
    try {
      const bill = await api.getStudentBill(billSearch, billMonth);
      setStudentBill(bill);
    } catch (error) {
      setExtraMessage(error.message);
    }
  }

  async function submitMessOff(event) {
    event.preventDefault();

    try {
      const response = await api.createMessOff(messOffForm);
      setMessOffMessage(response.message);
      setScannedPayload(response.student || null);
      await loadMessOffs(messOffForm.student);
      if (billSearch === messOffForm.student) {
        const bill = await api.getStudentBill(billSearch, billMonth);
        setStudentBill(bill);
      }
    } catch (error) {
      setMessOffMessage(error.message);
    }
  }

  async function loadMessOffs(studentIdentifier = messOffForm.student) {
    try {
      const items = await api.getMessOffs(studentIdentifier);
      setMessOffList(items);
    } catch (error) {
      setMessOffMessage(error.message);
    }
  }

  return (
    <AppShell portalTitle="Worker Dashboard">
      <div style={{ display: "flex" }}>
        <div style={shellStyles.sidebar}>
          <div style={shellStyles.sidebarHeading}>Worker Menu</div>
          <SidebarItem title="QR Scanner" id="scanner" current={page} setCurrent={setPage} />
          <SidebarItem title="Extra Items" id="extras" current={page} setCurrent={setPage} />
          <SidebarItem title="Mess Off" id="mess-off" current={page} setCurrent={setPage} />
          <SidebarItem title="Student Bills" id="billing" current={page} setCurrent={setPage} />
          <SidebarItem title={`Pending Sync (${pendingCount})`} id="sync" current={page} setCurrent={setPage} />
          <SidebarItem title="Logout" id="logout" current="" setCurrent={logout} />
        </div>

        <div style={shellStyles.content}>
          {page === "scanner" && (
            <div style={shellStyles.card}>
              <h2 style={shellStyles.title}>QR Scanner & Attendance</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
                <div>
                  <div style={{ border: "1px solid #ccc", borderRadius: "10px", padding: "10px", background: "#fff" }}>
                    <video ref={videoRef} style={{ width: "100%", minHeight: "260px", background: "#000" }} muted />
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button type="button" onClick={startCamera} style={{ ...shellStyles.button, width: "180px" }}>
                      Start Camera
                    </button>
                    <button type="button" onClick={stopCamera} style={{ ...shellStyles.button, width: "180px", backgroundColor: "#c9302c" }}>
                      Stop Camera
                    </button>
                  </div>

                  <label style={{ ...shellStyles.label, marginTop: "15px" }}>Manual QR Data</label>
                  <textarea
                    rows="6"
                    value={manualQr}
                    onChange={(event) => setManualQr(event.target.value)}
                    style={{ ...shellStyles.input, marginBottom: "10px" }}
                    placeholder='Paste QR JSON like {"userId":"...","name":"...","rollNumber":"...","role":"student"}'
                  />
                  <button type="button" onClick={() => parseQrText(manualQr, { autoMark: true })} style={{ ...shellStyles.button, width: "220px" }}>
                    Parse & Mark Attendance
                  </button>
                  <label style={{ ...shellStyles.label, marginTop: "15px" }}>Upload QR Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => extractQrFromImageFile(event.target.files?.[0], { autoMark: true })}
                    style={{ ...shellStyles.input, padding: "6px 10px" }}
                  />
                </div>

                <div>
                  <div style={{ ...shellStyles.card, boxShadow: "none", border: "1px solid #eee", padding: "20px" }}>
                    <h3 style={{ marginTop: 0, color: "#003A6A" }}>Scanned User Details</h3>
                    <img
                      src={getStudentImageSrc(scannedPayload || lastResponse?.student || {})}
                      alt="Scanned student"
                      style={{ width: "140px", height: "165px", objectFit: "cover", border: "1px solid #ccc", marginBottom: "15px" }}
                    />
                    <p><b>Name:</b> {scannedPayload?.name || "-"}</p>
                    <p><b>Roll Number:</b> {scannedPayload?.rollNumber || "-"}</p>
                    <p><b>Role:</b> {scannedPayload?.role || "-"}</p>
                    <p><b>Department:</b> {scannedPayload?.department || "-"}</p>
                    <p><b>Hostel / Room:</b> {scannedPayload?.hostel || "-"} {scannedPayload?.roomNo ? ` / ${scannedPayload.roomNo}` : ""}</p>
                    <p><b>User ID:</b> {scannedPayload?.userId || "-"}</p>
                    <button type="button" onClick={() => markAttendance()} style={shellStyles.button}>
                      Mark Attendance
                    </button>
                    <button type="button" onClick={syncPendingAttendance} style={{ ...shellStyles.button, backgroundColor: "#5cb85c" }}>
                      Sync Pending Data
                    </button>
                  </div>

                  <div style={{ marginTop: "20px", ...shellStyles.card }}>
                    <h3 style={{ marginTop: 0, color: "#003A6A" }}>Status</h3>
                    <p>{scannerMessage || "Scanner ready."}</p>
                    <p><b>Camera:</b> {cameraActive ? "Active" : "Inactive"}</p>
                    <p><b>Browser:</b> {navigator.onLine ? "Online" : "Offline"}</p>
                    <p><b>Meal Slot:</b> {lastResponse?.mealType || "-"}</p>
                    {lastResponse?.student ? (
                      <p>
                        <b>Last attendance:</b> {lastResponse.student.name} ({lastResponse.student.rollNumber})
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}

          {page === "sync" && (
            <div style={shellStyles.card}>
              <h2 style={shellStyles.title}>Offline Attendance Queue</h2>
              <button type="button" onClick={syncPendingAttendance} style={{ ...shellStyles.button, width: "220px" }}>
                Sync All Pending Data
              </button>
              <table style={{ ...shellStyles.table, marginTop: "20px" }}>
                <thead style={shellStyles.tableHead}>
                  <tr>
                    <th style={shellStyles.th}>Queued At</th>
                    <th style={shellStyles.th}>Date</th>
                    <th style={shellStyles.th}>Time</th>
                    <th style={shellStyles.th}>QR Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {offlineQueue.length === 0 ? (
                    <tr>
                      <td style={shellStyles.td} colSpan="4">
                        No pending offline records.
                      </td>
                    </tr>
                  ) : (
                    offlineQueue.map((entry) => (
                      <tr key={entry.id}>
                        <td style={shellStyles.td}>{entry.id}</td>
                        <td style={shellStyles.td}>{entry.date}</td>
                        <td style={shellStyles.td}>{entry.time}</td>
                        <td style={shellStyles.td}>{entry.qrData.slice(0, 80)}...</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {page === "extras" && (
            <div style={shellStyles.card}>
              <h2 style={shellStyles.title}>Extra Items Scanner</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
                <div>
                  <div style={{ border: "1px solid #ccc", borderRadius: "10px", padding: "10px", background: "#fff" }}>
                    <video ref={videoRef} style={{ width: "100%", minHeight: "260px", background: "#000" }} muted />
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button type="button" onClick={startCamera} style={{ ...shellStyles.button, width: "180px" }}>
                      Start Camera
                    </button>
                    <button type="button" onClick={stopCamera} style={{ ...shellStyles.button, width: "180px", backgroundColor: "#c9302c" }}>
                      Stop Camera
                    </button>
                  </div>
                  <label style={{ ...shellStyles.label, marginTop: "15px" }}>Select Extra Item</label>
                  {catalog.length === 0 ? (
                    <div style={{ ...shellStyles.card, boxShadow: "none", border: "1px solid #ddd", padding: "12px", marginBottom: "15px" }}>
                      Extra items catalog is empty.
                    </div>
                  ) : null}
                  <select
                    value={selectedItemCode}
                    onChange={(event) => setSelectedItemCode(event.target.value)}
                    style={{ ...shellStyles.input, marginBottom: "15px" }}
                  >
                    {catalog.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.name} - Rs. {item.priceLabel || item.price}
                      </option>
                    ))}
                  </select>
                  <label style={shellStyles.label}>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={extraQuantity}
                    onChange={(event) => setExtraQuantity(Math.max(1, Number(event.target.value) || 1))}
                    style={{ ...shellStyles.input, maxWidth: "180px" }}
                  />
                  <label style={{ ...shellStyles.label, marginTop: "15px" }}>Manual QR Data</label>
                  <textarea
                    rows="5"
                    value={manualQr}
                    onChange={(event) => setManualQr(event.target.value)}
                    style={{ ...shellStyles.input, marginBottom: "10px" }}
                  />
                  <button type="button" onClick={() => parseQrText(manualQr, { autoAddExtra: true })} style={{ ...shellStyles.button, width: "220px" }}>
                    Add Extra With QR
                  </button>
                  <label style={{ ...shellStyles.label, marginTop: "15px" }}>Upload QR Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => extractQrFromImageFile(event.target.files?.[0], { autoAddExtra: true })}
                    style={{ ...shellStyles.input, padding: "6px 10px" }}
                  />
                </div>
                <div>
                  <div style={{ ...shellStyles.card, boxShadow: "none", border: "1px solid #eee", padding: "20px" }}>
                    <h3 style={{ marginTop: 0, color: "#003A6A" }}>Student & Extra Detail</h3>
                    <img
                      src={getStudentImageSrc(scannedPayload || {})}
                      alt="Student"
                      style={{ width: "140px", height: "165px", objectFit: "cover", border: "1px solid #ccc", marginBottom: "15px" }}
                    />
                    <p><b>Name:</b> {scannedPayload?.name || "-"}</p>
                    <p><b>Roll Number:</b> {scannedPayload?.rollNumber || "-"}</p>
                    <p><b>Selected Item:</b> {selectedExtraItem?.name || "-"}</p>
                    <p><b>Item Rate:</b> Rs. {selectedExtraItem?.priceLabel || "-"}</p>
                    <p><b>Quantity:</b> {extraQuantity}</p>
                    <p><b>Status:</b> {extraMessage || "Ready for continuous QR scan."}</p>
                    {lastExtraCharge ? (
                      <p><b>Last charge:</b> Rs. {lastExtraCharge.totalPrice} on {lastExtraCharge.date}</p>
                    ) : null}
                  </div>
                  <div style={{ marginTop: "20px", ...shellStyles.card, boxShadow: "none", border: "1px solid #eee", padding: "20px" }}>
                    <h3 style={{ marginTop: 0, color: "#003A6A" }}>Mapped Extra Items List</h3>
                    <div style={{ maxHeight: "320px", overflowY: "auto", border: "1px solid #ddd" }}>
                      <table style={shellStyles.table}>
                        <thead style={shellStyles.tableHead}>
                          <tr>
                            <th style={shellStyles.th}>Code</th>
                            <th style={shellStyles.th}>Item</th>
                            <th style={shellStyles.th}>Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {catalog.map((item) => (
                            <tr key={item.code} style={{ background: item.code === selectedItemCode ? "#eef6ff" : "white" }}>
                              <td style={shellStyles.td}>{item.code}</td>
                              <td style={shellStyles.td}>{item.name}</td>
                              <td style={shellStyles.td}>Rs. {item.priceLabel || item.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {page === "billing" && (
            <div style={shellStyles.card}>
              <h2 style={shellStyles.title}>Student Billing Search</h2>
              <div style={{ display: "flex", gap: "15px", alignItems: "end", flexWrap: "wrap", marginBottom: "20px" }}>
                <div>
                  <label style={shellStyles.label}>Student Roll No / Username</label>
                  <input value={billSearch} onChange={(event) => setBillSearch(event.target.value)} style={{ ...shellStyles.input, width: "260px" }} />
                </div>
                <div>
                  <label style={shellStyles.label}>Month</label>
                  <input type="month" value={billMonth} onChange={(event) => setBillMonth(event.target.value)} style={{ ...shellStyles.input, width: "180px" }} />
                </div>
                <button type="button" onClick={searchStudentBill} style={{ ...shellStyles.button, width: "180px", marginTop: 0 }}>
                  Search Bill
                </button>
              </div>

              {studentBill ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "15px", marginBottom: "20px" }}>
                    <BillSummaryCard label="Meals Total" value={studentBill.summary.attendanceTotal} />
                    <BillSummaryCard label="Extras Total" value={studentBill.summary.extrasTotal} />
                    <BillSummaryCard label="Grand Total" value={studentBill.summary.grandTotal} />
                  </div>
                  <p><b>Student:</b> {studentBill.student?.name} ({studentBill.student?.rollNumber})</p>
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
                      {[...(studentBill.attendanceItems || []).map((item) => ({
                        key: `meal-${item._id}`,
                        date: item.date,
                        type: item.excludedByMessOff ? "Mess Off" : "Meal",
                        detail: item.excludedByMessOff ? `${item.mealType} excluded from bill` : `${item.mealType} (${item.time})`,
                        amount: item.rate,
                      })), ...(studentBill.extraItems || []).map((item) => ({
                        key: `extra-${item._id}`,
                        date: item.date,
                        type: "Extra",
                        detail: `${item.itemName} x ${item.quantity}`,
                        amount: item.totalPrice,
                      }))].sort((a, b) => `${b.date}${b.type}`.localeCompare(`${a.date}${a.type}`)).map((entry) => (
                        <tr key={entry.key}>
                          <td style={shellStyles.td}>{entry.date}</td>
                          <td style={shellStyles.td}>{entry.type}</td>
                          <td style={shellStyles.td}>{entry.detail}</td>
                          <td style={shellStyles.td}>Rs. {entry.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <p>Search a student to view the monthly bill.</p>
              )}
            </div>
          )}

          {page === "mess-off" && (
            <div style={shellStyles.card}>
              <h2 style={shellStyles.title}>Mess Off Management</h2>
              {messOffMessage ? <p style={{ color: "#990000" }}>{messOffMessage}</p> : null}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
                <div>
                  <form onSubmit={submitMessOff}>
                    <label style={shellStyles.label}>Student Roll No / Username</label>
                    <input
                      value={messOffForm.student}
                      onChange={(event) => setMessOffForm({ ...messOffForm, student: event.target.value })}
                      style={{ ...shellStyles.input, marginBottom: "15px" }}
                    />

                    <label style={shellStyles.label}>From Date</label>
                    <input
                      type="date"
                      value={messOffForm.fromDate}
                      onChange={(event) => setMessOffForm({ ...messOffForm, fromDate: event.target.value })}
                      style={{ ...shellStyles.input, marginBottom: "15px" }}
                    />

                    <label style={shellStyles.label}>To Date</label>
                    <input
                      type="date"
                      value={messOffForm.toDate}
                      onChange={(event) => setMessOffForm({ ...messOffForm, toDate: event.target.value })}
                      style={{ ...shellStyles.input, marginBottom: "15px" }}
                    />

                    <label style={shellStyles.label}>Meal Type</label>
                    <select
                      value={messOffForm.mealType}
                      onChange={(event) => setMessOffForm({ ...messOffForm, mealType: event.target.value })}
                      style={{ ...shellStyles.input, marginBottom: "15px" }}
                    >
                      <option value="all">All Meals</option>
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                    </select>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button type="submit" style={{ ...shellStyles.button, width: "220px" }}>
                        Save Mess Off
                      </button>
                      <button
                        type="button"
                        onClick={() => loadMessOffs()}
                        style={{ ...shellStyles.button, width: "220px", backgroundColor: "#5cb85c" }}
                      >
                        View Student Mess Off
                      </button>
                    </div>
                  </form>
                </div>

                <div>
                  <div style={{ ...shellStyles.card, boxShadow: "none", border: "1px solid #eee", padding: "20px" }}>
                    <h3 style={{ marginTop: 0, color: "#003A6A" }}>Mess Off Rules</h3>
                    <p><b>Student:</b> {messOffForm.student || "-"}</p>
                    <p><b>From:</b> {messOffForm.fromDate || "-"}</p>
                    <p><b>To:</b> {messOffForm.toDate || "-"}</p>
                    <p><b>Meal:</b> {messOffForm.mealType}</p>
                    <p><b>Billing effect:</b> Meals inside this range will show as mess off and their meal amount becomes zero.</p>
                  </div>
                </div>
              </div>

              <h3 style={{ marginTop: "30px", color: "#003A6A" }}>Saved Mess Off Entries</h3>
              <table style={shellStyles.table}>
                <thead style={shellStyles.tableHead}>
                  <tr>
                    <th style={shellStyles.th}>Student</th>
                    <th style={shellStyles.th}>From</th>
                    <th style={shellStyles.th}>To</th>
                    <th style={shellStyles.th}>Meal</th>
                    <th style={shellStyles.th}>Created By</th>
                  </tr>
                </thead>
                <tbody>
                  {messOffList.length === 0 ? (
                    <tr>
                      <td style={shellStyles.td} colSpan="5">
                        No mess off entries found.
                      </td>
                    </tr>
                  ) : (
                    messOffList.map((item) => (
                      <tr key={item._id}>
                        <td style={shellStyles.td}>
                          {item.userId?.name || item.userId?.username || "-"} ({item.userId?.rollNumber || "-"})
                        </td>
                        <td style={shellStyles.td}>{item.fromDate}</td>
                        <td style={shellStyles.td}>{item.toDate}</td>
                        <td style={shellStyles.td}>{item.mealType}</td>
                        <td style={shellStyles.td}>{item.createdBy?.name || item.createdBy?.username || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
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
