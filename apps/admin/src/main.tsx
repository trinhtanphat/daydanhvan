import { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type TeacherReview = { id: string; name: string; verified: boolean; moderationStatus: string };

type Report = { id: string; reason: string; status: string; targetUserId: string };

function AdminApp() {
  const [apiUrl, setApiUrl] = useState(localStorage.getItem("ddv-admin-api") ?? "");
  const [adminKey, setAdminKey] = useState(sessionStorage.getItem("ddv-admin-key") ?? "");
  const [teachers, setTeachers] = useState<TeacherReview[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [status, setStatus] = useState("Chưa kết nối");

  const headers = () => ({ "X-Admin-Key": adminKey, "Content-Type": "application/json" });
  const connect = async () => {
    const base = apiUrl.replace(/\/$/, "");
    localStorage.setItem("ddv-admin-api", base);
    sessionStorage.setItem("ddv-admin-key", adminKey);
    setStatus("Đang tải...");
    try {
      const [teachersRes, reportsRes] = await Promise.all([
        fetch(`${base}/api/v1/admin/teachers`, { headers: headers() }),
        fetch(`${base}/api/v1/admin/reports`, { headers: headers() })
      ]);
      if (!teachersRes.ok || !reportsRes.ok) throw new Error("Không có quyền truy cập");
      setTeachers((await teachersRes.json()).teachers);
      setReports((await reportsRes.json()).reports);
      setStatus("Đã kết nối");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Không thể kết nối");
    }
  };

  const approve = async (id: string) => {
    const base = apiUrl.replace(/\/$/, "");
    const response = await fetch(`${base}/api/v1/admin/teachers/${id}/approve`, { method: "POST", headers: headers() });
    if (!response.ok) return setStatus("Duyệt thất bại");
    setTeachers((current) => current.map((teacher) => teacher.id === id ? { ...teacher, verified: true, moderationStatus: "approved" } : teacher));
    setStatus("Đã duyệt hồ sơ");
  };

  return <div className="shell"><aside><div className="brand">Dạy đánh vần<small>Administration</small></div><nav><b>Tổng quan</b><span>Hồ sơ giáo viên</span><span>Báo cáo</span><span>Nhật ký</span></nav><div className="secure">🔒 Admin API được bảo vệ bằng secret/Access.</div></aside><main><header><div><small>QUẢN TRỊ HỆ THỐNG</small><h1>Moderation Console</h1></div><span className={status === "Đã kết nối" ? "ok" : "badge"}>{status}</span></header><section className="connect"><input placeholder="https://api.example.com" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)}/><input type="password" placeholder="Admin key" value={adminKey} onChange={(e) => setAdminKey(e.target.value)}/><button onClick={() => void connect()}>Kết nối</button></section><div className="stats"><article><b>{teachers.length}</b><span>Hồ sơ chờ/đang duyệt</span></article><article><b>{teachers.filter((t)=>t.verified).length}</b><span>Đã xác minh</span></article><article><b>{reports.length}</b><span>Báo cáo mở</span></article></div><section className="panel"><div className="panelHead"><h2>Hồ sơ giáo viên</h2><span>Không hiển thị tọa độ nhà riêng</span></div>{teachers.length === 0 ? <p className="empty">Kết nối API để tải danh sách moderation.</p> : teachers.map((teacher)=><div className="row" key={teacher.id}><div className="avatar">{teacher.name.split(" ").at(-1)?.[0]}</div><div><b>{teacher.name}</b><small>{teacher.id}</small></div><span className="state">{teacher.moderationStatus}</span><button disabled={teacher.verified} onClick={()=>void approve(teacher.id)}>{teacher.verified ? "Đã duyệt" : "Duyệt"}</button></div>)}</section><section className="panel"><div className="panelHead"><h2>Báo cáo</h2><span>{reports.length} mục</span></div>{reports.length === 0 ? <p className="empty">Chưa có báo cáo cần xử lý.</p> : reports.map((report)=><div className="row" key={report.id}><div className="avatar warn">!</div><div><b>{report.reason}</b><small>Target: {report.targetUserId}</small></div><span className="state">{report.status}</span></div>)}</section></main></div>;
}

createRoot(document.getElementById("root")!).render(<AdminApp/>);
