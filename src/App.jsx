import { useState, useEffect, useRef } from "react";

const DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
const DEDUCTION_KEYS = ["internet", "stationery", "house", "other"];
const DEDUCTION_LABELS = {
  internet: "ইন্টারনেট",
  stationery: "স্টেশনারি",
  house: "বাসা বাজার",
  other: "অতিরিক্ত (Extra)",
};

const emptyShift = () =>
  DENOMINATIONS.reduce((acc, d) => ({ ...acc, [d]: "" }), {});

const emptyDeductions = () =>
  DEDUCTION_KEYS.reduce((acc, k) => ({ ...acc, [k]: "" }), {});

const calcShiftTotal = (shift) =>
  DENOMINATIONS.reduce((sum, d) => sum + d * (parseInt(shift[d]) || 0), 0);

const formatBDT = (n) =>
  "৳" + Math.abs(n).toLocaleString("en-BD");

const todayStr = () => new Date().toISOString().slice(0, 10);

const formatDisplayDate = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default function App() {
  const [page, setPage] = useState("entry"); // entry | history | report
  const [activeTab, setActiveTab] = useState("day");
  const [day, setDay] = useState(emptyShift());
  const [night, setNight] = useState(emptyShift());
  const [deductions, setDeductions] = useState(emptyDeductions());
  const [submittedBy, setSubmittedBy] = useState("Jahed");
  const [reports, setReports] = useState([]);
  const [viewReport, setViewReport] = useState(null);
  const [saveMsg, setSaveMsg] = useState("");
  const [editDate, setEditDate] = useState(todayStr());
  const printRef = useRef();

  useEffect(() => {
    const saved = localStorage.getItem("shop_reports");
    if (saved) setReports(JSON.parse(saved));
  }, []);

  const dayTotal = calcShiftTotal(day);
  const nightTotal = calcShiftTotal(night);
  const totalDeductions = DEDUCTION_KEYS.filter(k => k !== "other")
    .reduce((sum, k) => sum + (parseInt(deductions[k]) || 0), 0);
  const extra = parseInt(deductions.other) || 0;
  const netTotal = nightTotal - dayTotal - totalDeductions - extra;

  const handleShiftInput = (shift, setShift, denom, val) => {
    setShift(prev => ({ ...prev, [denom]: val }));
  };

  const saveReport = () => {
    const report = {
      id: Date.now(),
      date: editDate,
      day: { ...day },
      night: { ...night },
      deductions: { ...deductions },
      submittedBy,
      dayTotal,
      nightTotal,
      netTotal,
    };
    const updated = [report, ...reports.filter(r => r.date !== editDate)];
    updated.sort((a, b) => b.date.localeCompare(a.date));
    setReports(updated);
    localStorage.setItem("shop_reports", JSON.stringify(updated));
    setSaveMsg("Report saved!");
    setTimeout(() => setSaveMsg(""), 2500);
  };

  const openReport = (r) => {
    setViewReport(r);
    setPage("report");
  };

  const handlePrint = (report) => {
    const r = report || {
      date: editDate, day, night, deductions,
      dayTotal, nightTotal, netTotal, submittedBy
    };
    setViewReport(r);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const deleteReport = (id) => {
    const updated = reports.filter(r => r.id !== id);
    setReports(updated);
    localStorage.setItem("shop_reports", JSON.stringify(updated));
    setPage("history");
  };

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --green: #1a4f3a;
          --green-light: #e6f4ee;
          --green-mid: #2d7a55;
          --red: #c0392b;
          --amber: #d97706;
          --bg: #f5f7f5;
          --surface: #ffffff;
          --border: #e2e8e4;
          --text: #1a2520;
          --text-muted: #6b7c74;
          --font: 'IBM Plex Sans', sans-serif;
          --mono: 'IBM Plex Mono', monospace;
        }

        body { font-family: var(--font); background: var(--bg); color: var(--text); }

        .app { max-width: 560px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }

        /* TOPBAR */
        .topbar {
          background: var(--green);
          padding: 14px 18px 12px;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky; top: 0; z-index: 100;
        }
        .topbar-info h1 { font-size: 15px; font-weight: 600; letter-spacing: 0.01em; }
        .topbar-info p { font-size: 11px; opacity: 0.7; margin-top: 2px; }
        .topbar-actions { display: flex; gap: 8px; }
        .icon-btn {
          background: rgba(255,255,255,0.12);
          border: none; color: #fff;
          border-radius: 8px; padding: 7px 12px;
          font-size: 12px; font-family: var(--font);
          cursor: pointer; display: flex; align-items: center; gap: 5px;
          transition: background 0.15s;
        }
        .icon-btn:hover { background: rgba(255,255,255,0.22); }
        .icon-btn svg { width: 14px; height: 14px; }

        /* TABS */
        .tabs { display: flex; background: var(--surface); border-bottom: 1px solid var(--border); }
        .tab {
          flex: 1; padding: 11px; text-align: center; font-size: 13px;
          font-weight: 500; color: var(--text-muted);
          cursor: pointer; border-bottom: 2px solid transparent;
          transition: all 0.15s; font-family: var(--font);
        }
        .tab.active { color: var(--green); border-bottom-color: var(--green); }

        /* BODY */
        .body { flex: 1; padding: 0 0 90px; }

        /* SECTION */
        .section { background: var(--surface); margin: 12px; border-radius: 12px; border: 1px solid var(--border); overflow: hidden; }
        .section-title {
          font-size: 11px; font-weight: 600; letter-spacing: 0.07em;
          text-transform: uppercase; color: var(--text-muted);
          padding: 10px 14px 8px; border-bottom: 1px solid var(--border);
          background: #fafbfa;
        }

        /* DENOM TABLE */
        .denom-table { width: 100%; border-collapse: collapse; }
        .denom-table th {
          font-size: 11px; color: var(--text-muted); font-weight: 500;
          padding: 6px 14px; text-align: right; border-bottom: 1px solid var(--border);
          background: #fafbfa;
        }
        .denom-table th:first-child { text-align: left; }
        .denom-table td { padding: 5px 14px; border-bottom: 1px solid #f0f4f1; font-size: 13px; }
        .denom-table td:first-child { font-weight: 500; color: var(--green); font-family: var(--mono); }
        .denom-table td:last-child { text-align: right; font-family: var(--mono); color: var(--text-muted); font-size: 12px; }
        .denom-table input[type=number] {
          width: 70px; border: 1px solid var(--border); border-radius: 6px;
          padding: 4px 8px; font-size: 13px; text-align: right;
          font-family: var(--mono); color: var(--text); background: var(--bg);
          transition: border-color 0.15s;
          float: right;
        }
        .denom-table input[type=number]:focus { outline: none; border-color: var(--green-mid); }
        .denom-table input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
        .total-row td { font-weight: 600; background: var(--green-light); color: var(--green) !important; font-size: 13px; padding: 7px 14px; }

        /* DEDUCTIONS */
        .deduct-row { display: flex; align-items: center; padding: 8px 14px; border-bottom: 1px solid #f0f4f1; gap: 10px; }
        .deduct-label { flex: 1; font-size: 13px; }
        .deduct-input {
          width: 90px; border: 1px solid var(--border); border-radius: 6px;
          padding: 4px 8px; font-size: 13px; text-align: right;
          font-family: var(--mono); color: var(--text); background: var(--bg);
        }
        .deduct-input:focus { outline: none; border-color: var(--green-mid); }
        .deduct-val { width: 70px; text-align: right; font-family: var(--mono); font-size: 12px; color: var(--red); }
        .deduct-val.extra { color: #1a7a45; }

        /* DATE & SUBMITTED */
        .meta-row { padding: 10px 14px; display: flex; align-items: center; gap: 10px; }
        .meta-row label { font-size: 12px; color: var(--text-muted); min-width: 90px; }
        .meta-row input { flex: 1; border: 1px solid var(--border); border-radius: 6px; padding: 5px 10px; font-size: 13px; font-family: var(--font); background: var(--bg); color: var(--text); }
        .meta-row input:focus { outline: none; border-color: var(--green-mid); }

        /* SUMMARY BAR */
        .summary-bar {
          position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 100%; max-width: 560px;
          background: var(--surface); border-top: 1px solid var(--border);
          padding: 10px 12px; display: flex; gap: 8px; align-items: stretch;
          z-index: 99;
        }
        .sum-card { flex: 1; background: var(--bg); border-radius: 8px; padding: 7px 10px; text-align: center; border: 1px solid var(--border); }
        .sum-card .lbl { font-size: 10px; color: var(--text-muted); }
        .sum-card .val { font-size: 15px; font-weight: 600; font-family: var(--mono); margin-top: 1px; }
        .val-red { color: var(--red); }
        .val-green { color: #1a7a45; }
        .save-btn {
          background: var(--green); color: #fff; border: none;
          border-radius: 10px; padding: 0 18px;
          font-size: 14px; font-weight: 600; font-family: var(--font);
          cursor: pointer; transition: background 0.15s; white-space: nowrap;
        }
        .save-btn:hover { background: var(--green-mid); }
        .save-msg { position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%); background: var(--green); color: #fff; padding: 8px 20px; border-radius: 20px; font-size: 13px; z-index: 200; }

        /* HISTORY */
        .history-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 13px 16px; border-bottom: 1px solid var(--border);
          cursor: pointer; transition: background 0.12s;
        }
        .history-item:hover { background: #f5f9f6; }
        .hi-date { font-size: 14px; font-weight: 500; }
        .hi-sub { font-size: 11px; color: var(--text-muted); margin-top: 3px; }
        .hi-amount { font-size: 16px; font-weight: 600; font-family: var(--mono); color: #1a7a45; }
        .badge { display: inline-block; font-size: 10px; padding: 2px 7px; border-radius: 20px; background: var(--green-light); color: var(--green); margin-left: 6px; font-weight: 500; }

        /* REPORT VIEW */
        .report-header { padding: 16px; border-bottom: 1px solid var(--border); }
        .report-header h2 { font-size: 17px; font-weight: 600; }
        .report-header p { font-size: 12px; color: var(--text-muted); margin-top: 3px; }
        .report-actions { padding: 12px 16px; display: flex; gap: 8px; }
        .btn-outline {
          flex: 1; border: 1px solid var(--border); background: var(--surface);
          border-radius: 8px; padding: 9px; font-size: 13px;
          font-family: var(--font); cursor: pointer; color: var(--text);
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .btn-outline:hover { background: var(--bg); }
        .btn-danger { border-color: #fca5a5; color: var(--red); }
        .btn-danger:hover { background: #fff5f5; }

        /* PRINT */
        @media print {
          @page { size: 4in 6in; margin: 5mm; }
          .app, body { background: #fff !important; }
          .topbar, .tabs, .summary-bar, .report-actions, .no-print { display: none !important; }
          .print-area { display: block !important; }
          .section { border: none; margin: 0; border-radius: 0; }
        }

        .print-area {
          display: none;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          color: #000;
        }
        .pa-header { text-align: center; padding-bottom: 6px; border-bottom: 1px dashed #888; margin-bottom: 6px; }
        .pa-header .shop { font-size: 13px; font-weight: bold; }
        .pa-header .addr { font-size: 9px; }
        .pa-two-col { display: flex; gap: 4px; border-bottom: 1px dashed #888; padding-bottom: 6px; margin-bottom: 6px; }
        .pa-col { flex: 1; }
        .pa-col-title { font-weight: bold; text-align: center; border-bottom: 1px dotted #ccc; margin-bottom: 4px; padding-bottom: 2px; font-size: 10px; }
        .pa-row { display: flex; justify-content: space-between; padding: 1px 0; font-size: 10px; }
        .pa-total { font-weight: bold; border-top: 1px dotted #ccc; margin-top: 3px; padding-top: 3px; }
        .pa-divider { width: 1px; background: #ccc; margin: 0 4px; }
        .pa-summary { }
        .pa-sum-row { display: flex; justify-content: space-between; padding: 2px 0; font-size: 10px; }
        .pa-sum-row.big { font-weight: bold; font-size: 12px; border-top: 1px solid #000; margin-top: 3px; padding-top: 3px; }
        .pa-footer { text-align: center; margin-top: 6px; font-size: 9px; border-top: 1px dashed #888; padding-top: 5px; }
        .empty-state { text-align: center; padding: 48px 24px; color: var(--text-muted); }
        .empty-state svg { width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.3; }
        .empty-state p { font-size: 14px; }
      `}</style>

      {/* TOPBAR */}
      <div className="topbar no-print">
        <div className="topbar-info">
          <h1>Master Photostate & Telecom</h1>
          <p>15, Surma Market, Sylhet-3100</p>
        </div>
        <div className="topbar-actions">
          {page === "entry" && (
            <button className="icon-btn" onClick={() => setPage("history")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h5v5H3zM16 3h5v5h-5zM3 16h5v5H3zM16 16h5v5h-5z"/></svg>
              History
            </button>
          )}
          {page !== "entry" && (
            <button className="icon-btn" onClick={() => setPage("entry")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Entry
            </button>
          )}
        </div>
      </div>

      {/* PRINT AREA - always rendered, hidden unless printing */}
      <PrintView report={viewReport || { date: editDate, day, night, deductions, dayTotal, nightTotal, netTotal, submittedBy }} />

      {/* PAGES */}
      {page === "entry" && (
        <EntryPage
          day={day} setDay={setDay}
          night={night} setNight={setNight}
          deductions={deductions} setDeductions={setDeductions}
          submittedBy={submittedBy} setSubmittedBy={setSubmittedBy}
          editDate={editDate} setEditDate={setEditDate}
          activeTab={activeTab} setActiveTab={setActiveTab}
          dayTotal={dayTotal} nightTotal={nightTotal}
          netTotal={netTotal} totalDeductions={totalDeductions} extra={extra}
          onSave={saveReport} onPrint={() => handlePrint(null)}
          saveMsg={saveMsg}
        />
      )}

      {page === "history" && (
        <HistoryPage reports={reports} onOpen={openReport} />
      )}

      {page === "report" && viewReport && (
        <ReportPage
          report={viewReport}
          onBack={() => setPage("history")}
          onPrint={() => handlePrint(viewReport)}
          onDelete={() => deleteReport(viewReport.id)}
        />
      )}
    </div>
  );
}

function EntryPage({ day, setDay, night, setNight, deductions, setDeductions,
  submittedBy, setSubmittedBy, editDate, setEditDate,
  activeTab, setActiveTab, dayTotal, nightTotal, netTotal,
  totalDeductions, extra, onSave, onPrint, saveMsg }) {

  const shift = activeTab === "day" ? day : night;
  const setShift = activeTab === "day" ? setDay : setNight;
  const shiftTotal = activeTab === "day" ? dayTotal : nightTotal;

  return (
    <div className="body no-print">
      <div className="tabs">
        <div className={`tab ${activeTab === "day" ? "active" : ""}`} onClick={() => setActiveTab("day")}>☀ Day shift</div>
        <div className={`tab ${activeTab === "night" ? "active" : ""}`} onClick={() => setActiveTab("night")}>🌙 Night shift</div>
      </div>

      {/* Date & Name */}
      <div className="section" style={{ margin: "12px 12px 0" }}>
        <div className="meta-row">
          <label>Date</label>
          <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
        </div>
        <div className="meta-row" style={{ borderTop: "1px solid var(--border)" }}>
          <label>Submitted by</label>
          <input type="text" value={submittedBy} onChange={e => setSubmittedBy(e.target.value)} placeholder="Name" />
        </div>
      </div>

      {/* Denominations */}
      <div className="section">
        <div className="section-title">Cash Denominations — {activeTab === "day" ? "Day" : "Night"}</div>
        <table className="denom-table">
          <thead>
            <tr>
              <th>Note (৳)</th>
              <th style={{ textAlign: "right" }}>Count</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {DENOMINATIONS.map(d => (
              <tr key={d}>
                <td>৳{d}</td>
                <td>
                  <input
                    type="number" min="0"
                    value={shift[d]}
                    onChange={e => setShift(prev => ({ ...prev, [d]: e.target.value }))}
                    placeholder="0"
                  />
                </td>
                <td>{(d * (parseInt(shift[d]) || 0)).toLocaleString("en-BD")}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td>Total</td><td></td>
              <td>৳{shiftTotal.toLocaleString("en-BD")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Deductions — only show on night tab */}
      {activeTab === "night" && (
        <div className="section">
          <div className="section-title">Deductions & Extra</div>
          {DEDUCTION_KEYS.map(k => {
            const val = parseInt(deductions[k]) || 0;
            const isExtra = k === "other";
            return (
              <div className="deduct-row" key={k}>
                <span className="deduct-label">{DEDUCTION_LABELS[k]}</span>
                <input
                  type="number" min="0"
                  className="deduct-input"
                  value={deductions[k]}
                  onChange={e => setDeductions(prev => ({ ...prev, [k]: e.target.value }))}
                  placeholder="0"
                />
                <span className={`deduct-val ${isExtra ? "extra" : ""}`}>
                  {val > 0 ? (isExtra ? "+" : "-") + val.toLocaleString("en-BD") : "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary + Actions */}
      <div className="summary-bar">
        <div className="sum-card">
          <div className="lbl">Day</div>
          <div className="val val-red">-{dayTotal.toLocaleString("en-BD")}</div>
        </div>
        <div className="sum-card">
          <div className="lbl">Night</div>
          <div className="val">{nightTotal.toLocaleString("en-BD")}</div>
        </div>
        <div className="sum-card">
          <div className="lbl">Net</div>
          <div className={`val ${netTotal >= 0 ? "val-green" : "val-red"}`}>{netTotal.toLocaleString("en-BD")}</div>
        </div>
        <button className="save-btn" onClick={onSave}>Save</button>
        <button className="icon-btn" style={{ background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)" }} onClick={onPrint} title="Print">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/></svg>
        </button>
      </div>
      {saveMsg && <div className="save-msg">{saveMsg}</div>}
    </div>
  );
}

function HistoryPage({ reports, onOpen }) {
  if (reports.length === 0) {
    return (
      <div className="body no-print">
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <p>No reports saved yet.</p>
          <p style={{ fontSize: "12px", marginTop: "6px" }}>Save your first daily report to see it here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="body no-print">
      <div style={{ padding: "12px 12px 4px" }}>
        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{reports.length} report{reports.length !== 1 ? "s" : ""} saved</div>
      </div>
      <div className="section">
        {reports.map(r => (
          <div className="history-item" key={r.id} onClick={() => onOpen(r)}>
            <div>
              <div className="hi-date">{formatDisplayDate(r.date)}<span className="badge">Saved</span></div>
              <div className="hi-sub">By {r.submittedBy} · Receive: ৳{Math.abs(r.netTotal).toLocaleString("en-BD")}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="hi-amount">৳{Math.abs(r.netTotal).toLocaleString("en-BD")}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>net</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportPage({ report, onBack, onPrint, onDelete }) {
  const dayTotal = report.dayTotal ?? calcShiftTotal(report.day);
  const nightTotal = report.nightTotal ?? calcShiftTotal(report.night);

  return (
    <div className="body no-print">
      <div className="section" style={{ margin: "12px" }}>
        <div className="report-header">
          <h2>{formatDisplayDate(report.date)}</h2>
          <p>Submitted by {report.submittedBy}</p>
        </div>

        <div className="section-title" style={{ marginTop: 0 }}>Day shift denominations</div>
        <ShiftSummaryTable shift={report.day} total={dayTotal} />

        <div className="section-title">Night shift denominations</div>
        <ShiftSummaryTable shift={report.night} total={nightTotal} />

        <div className="section-title">Deductions & Extra</div>
        {DEDUCTION_KEYS.map(k => {
          const val = parseInt(report.deductions[k]) || 0;
          if (!val) return null;
          const isExtra = k === "other";
          return (
            <div className="deduct-row" key={k}>
              <span className="deduct-label">{DEDUCTION_LABELS[k]}</span>
              <span className={`deduct-val ${isExtra ? "extra" : ""}`} style={{ marginLeft: "auto" }}>
                {isExtra ? "+" : "-"}৳{val.toLocaleString("en-BD")}
              </span>
            </div>
          );
        })}

        <div style={{ padding: "12px 14px", borderTop: "2px solid var(--green-light)", background: "var(--green-light)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: 16 }}>
            <span>Net Total</span>
            <span style={{ color: report.netTotal >= 0 ? "#1a7a45" : "var(--red)", fontFamily: "var(--mono)" }}>
              ৳{Math.abs(report.netTotal).toLocaleString("en-BD")}
            </span>
          </div>
        </div>
      </div>

      <div className="report-actions">
        <button className="btn-outline" onClick={onPrint}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/></svg>
          Print 4×6
        </button>
        <button className="btn-outline btn-danger" onClick={onDelete}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
          Delete
        </button>
      </div>
    </div>
  );
}

function ShiftSummaryTable({ shift, total }) {
  const used = DENOMINATIONS.filter(d => parseInt(shift[d]) > 0);
  if (used.length === 0) return <div style={{ padding: "10px 14px", fontSize: 13, color: "var(--text-muted)" }}>No entries</div>;
  return (
    <table className="denom-table">
      <thead><tr><th>Note</th><th style={{ textAlign: "right" }}>Count</th><th>Total</th></tr></thead>
      <tbody>
        {used.map(d => (
          <tr key={d}>
            <td>৳{d}</td>
            <td style={{ textAlign: "right" }}>{shift[d]}</td>
            <td>{(d * parseInt(shift[d])).toLocaleString("en-BD")}</td>
          </tr>
        ))}
        <tr className="total-row"><td>Total</td><td></td><td>৳{total.toLocaleString("en-BD")}</td></tr>
      </tbody>
    </table>
  );
}

function PrintView({ report }) {
  if (!report) return null;
  const dayTotal = report.dayTotal ?? calcShiftTotal(report.day);
  const nightTotal = report.nightTotal ?? calcShiftTotal(report.night);
  const dayUsed = DENOMINATIONS.filter(d => parseInt(report.day[d]) > 0);
  const nightUsed = DENOMINATIONS.filter(d => parseInt(report.night[d]) > 0);
  const deductTotal = DEDUCTION_KEYS.filter(k => k !== "other").reduce((s, k) => s + (parseInt(report.deductions[k]) || 0), 0);
  const extra = parseInt(report.deductions.other) || 0;

  return (
    <div className="print-area" id="print-area">
      <div className="pa-header">
        <div className="shop">Master Photostate & Telecom</div>
        <div className="addr">15, Surma Market, Sylhet-3100 · Cell: 01726 308391</div>
        <div className="addr" style={{ marginTop: 3, fontWeight: "bold" }}>
          Online Working — {report.date ? report.date.split("-").reverse().join("/") : ""}
        </div>
      </div>

      <div className="pa-two-col">
        <div className="pa-col">
          <div className="pa-col-title">DAY</div>
          {dayUsed.map(d => (
            <div className="pa-row" key={d}>
              <span>৳{d}×{report.day[d]}</span>
              <span>{(d * parseInt(report.day[d])).toLocaleString()}</span>
            </div>
          ))}
          {dayUsed.length === 0 && <div className="pa-row"><span>—</span><span>0</span></div>}
          <div className="pa-row pa-total"><span>Total</span><span>{dayTotal.toLocaleString()}</span></div>
        </div>
        <div className="pa-divider"></div>
        <div className="pa-col">
          <div className="pa-col-title">NIGHT</div>
          {nightUsed.map(d => (
            <div className="pa-row" key={d}>
              <span>৳{d}×{report.night[d]}</span>
              <span>{(d * parseInt(report.night[d])).toLocaleString()}</span>
            </div>
          ))}
          {nightUsed.length === 0 && <div className="pa-row"><span>—</span><span>0</span></div>}
          <div className="pa-row pa-total"><span>Total</span><span>{nightTotal.toLocaleString()}</span></div>
        </div>
      </div>

      <div className="pa-summary">
        <div className="pa-sum-row"><span>Total Night</span><span>{nightTotal.toLocaleString()}</span></div>
        <div className="pa-sum-row"><span>Total Day</span><span>-{dayTotal.toLocaleString()}</span></div>
        {DEDUCTION_KEYS.map(k => {
          const val = parseInt(report.deductions[k]) || 0;
          if (!val) return null;
          const isExtra = k === "other";
          return (
            <div className="pa-sum-row" key={k}>
              <span>{DEDUCTION_LABELS[k]}</span>
              <span>{isExtra ? "+" : "-"}{val.toLocaleString()}</span>
            </div>
          );
        })}
        <div className="pa-sum-row big"><span>Total</span><span>{report.netTotal?.toLocaleString()}</span></div>
      </div>

      <div className="pa-footer">
        Alhamdulillah &nbsp;·&nbsp; {report.submittedBy}
      </div>
    </div>
  );
}
