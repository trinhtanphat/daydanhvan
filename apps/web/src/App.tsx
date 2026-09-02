import { useEffect, useMemo, useState } from "react";
import type { Teacher } from "@daydanhvan/contracts";
import { BottomNav, type TabId } from "./components/BottomNav";
import { RadarSearch } from "./components/RadarSearch";
import { TeacherCard } from "./components/TeacherCard";
import { fallbackTeachers, fetchTeachers } from "./lib/api";

const messages: ReadonlyArray<readonly [string, string, string]> = [
  ["Mai Anh", "Mình có thể học thử vào chiều thứ Bảy nhé.", "10:42"],
  ["Phương Linh", "Em gửi chị lộ trình 4 buổi đầu ạ.", "Hôm qua"]
];

export function App() {
  const [tab, setTab] = useState<TabId>("home");
  const [teachers, setTeachers] = useState<Teacher[]>(fallbackTeachers);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["mai-anh", "thu-ha"]));
  const [selected, setSelected] = useState<Teacher | null>(null);
  const [networkNotice, setNetworkNotice] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState(5);

  const load = async () => {
    try {
      const result = await fetchTeachers({ verified: verifiedOnly, maxDistanceKm: maxDistance });
      setTeachers(result);
      setNetworkNotice(false);
    } catch {
      setTeachers(fallbackTeachers.filter((teacher) => (!verifiedOnly || teacher.verified) && teacher.distanceKm <= maxDistance));
      setNetworkNotice(true);
    }
  };

  useEffect(() => { void load(); }, [verifiedOnly, maxDistance]);

  const favoriteTeachers = useMemo(() => teachers.filter((teacher) => favorites.has(teacher.id)), [teachers, favorites]);
  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="icon-button" aria-label="Menu">☰</button>
        <div className="brand"><span className="brand-mark">⌂</span><div><b>Dạy đánh vần</b><small>Tìm cô giáo gần bạn, học kèm dễ dàng</small></div></div>
        <button className="icon-button notification" aria-label="Thông báo">♢<i /></button>
      </header>

      <main>
        {networkNotice && <div className="network-notice">Đang dùng dữ liệu mẫu vì API chưa kết nối. <button onClick={() => void load()}>Thử lại</button></div>}

        {tab === "home" && <>
          <div className="location-row"><button>⌖ Cầu Giấy, Hà Nội⌄</button><button>✥ Cập nhật vị trí</button></div>
          <section className="hero-card">
            <div><span className="eyebrow">HỌC GẦN NHÀ · DỄ KẾT NỐI</span><h1>Tìm cô giáo gần bạn</h1><p>Học cùng cô giáo xinh đẹp, tận tâm và ở ngay quanh khu vực của bạn.</p><button className="primary" onClick={() => setTab("search")}>Tìm cô phù hợp</button></div>
            <div className="hero-illustration" aria-hidden="true"><span>A</span><span>Ă</span><span>Â</span><i>♥</i></div>
          </section>
          <SectionHeader title="Cô giáo quanh bạn" action="Bộ lọc" onAction={() => setTab("search")} />
          <div className="teacher-grid">{teachers.map((teacher) => <TeacherCard key={teacher.id} teacher={teacher} favorite={favorites.has(teacher.id)} onFavorite={() => toggleFavorite(teacher.id)} onOpen={() => setSelected(teacher)} />)}</div>
        </>}

        {tab === "search" && <>
          <div className="location-row"><button>⌖ Cầu Giấy, Hà Nội⌄</button><button>✥ Cập nhật vị trí</button></div>
          <RadarSearch teachers={teachers} />
          <div className="filter-row">
            <label>Khoảng cách <select value={maxDistance} onChange={(e) => setMaxDistance(Number(e.target.value))}><option value={2}>≤ 2 km</option><option value={5}>≤ 5 km</option><option value={10}>≤ 10 km</option></select></label>
            <label className="check-filter"><input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} /> Đã xác minh</label>
            <button onClick={() => { setMaxDistance(5); setVerifiedOnly(false); }}>Đặt lại</button>
          </div>
          <div className="teacher-list">{teachers.map((teacher) => <TeacherCard key={teacher.id} teacher={teacher} favorite={favorites.has(teacher.id)} onFavorite={() => toggleFavorite(teacher.id)} onOpen={() => setSelected(teacher)} />)}</div>
        </>}

        {tab === "messages" && <section className="page-card"><div className="page-heading"><span className="eyebrow">TRÒ CHUYỆN</span><h2>Tin nhắn</h2><p>Kết nối với cô giáo để trao đổi mục tiêu học và lịch phù hợp.</p></div>{messages.map(([name, text, time], index) => <button className="message-row" key={name}><div className="avatar-small">{name.split(" ").at(-1)?.[0]}</div><div><b>{name}</b><span>{text}</span></div><small>{time}{index === 0 && <i>1</i>}</small></button>)}</section>}

        {tab === "favorites" && <section><div className="page-heading"><span className="eyebrow">DANH SÁCH CỦA BẠN</span><h2>Yêu thích</h2><p>Lưu lại những cô giáo bạn muốn tìm hiểu thêm.</p></div>{favoriteTeachers.length ? <div className="teacher-grid">{favoriteTeachers.map((teacher) => <TeacherCard key={teacher.id} teacher={teacher} favorite onFavorite={() => toggleFavorite(teacher.id)} onOpen={() => setSelected(teacher)} />)}</div> : <EmptyState title="Chưa có cô giáo yêu thích" />}</section>}

        {tab === "account" && <section className="page-card account-card"><div className="profile-avatar">TT</div><h2>Phụ huynh học viên</h2><p>Cầu Giấy, Hà Nội</p><div className="settings-list"><button><span>◎</span><div><b>Thông tin tài khoản</b><small>Cập nhật tên và khu vực</small></div><em>›</em></button><button><span>⌖</span><div><b>Quyền vị trí</b><small>Chỉ dùng để tính khoảng cách gần đúng</small></div><em>›</em></button><button><span>♢</span><div><b>Thông báo</b><small>Tin nhắn và lịch học</small></div><em>›</em></button><button><span>?</span><div><b>An toàn & báo cáo</b><small>Quản lý nội dung không phù hợp</small></div><em>›</em></button></div></section>}
      </main>

      <BottomNav active={tab} onChange={setTab} />

      {selected && <div className="modal-backdrop" onMouseDown={() => setSelected(null)}><section className="teacher-modal" onMouseDown={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)}>×</button><div className="profile-avatar large">{selected.name.split(" ").at(-1)?.[0]}</div><span className="eyebrow">{selected.verified ? "✓ HỒ SƠ ĐÃ XÁC MINH" : "HỒ SƠ ĐANG XÁC MINH"}</span><h2>{selected.name}</h2><p className="modal-meta">{selected.age} tuổi · {selected.district} · {selected.distanceKm.toFixed(1)} km</p><h3>{selected.specialty}</h3><p>{selected.bio}</p><div className="stats"><span><b>{selected.experienceYears ?? 0}+</b><small>năm kinh nghiệm</small></span><span><b>{selected.rating?.toFixed(1) ?? "—"}</b><small>điểm đánh giá</small></span></div><div className="modal-actions"><button className="secondary" onClick={() => toggleFavorite(selected.id)}>{favorites.has(selected.id) ? "♥ Đã yêu thích" : "♡ Yêu thích"}</button><button className="primary" onClick={() => { setSelected(null); setTab("messages"); }}>Nhắn tin</button></div></section></div>}
    </div>
  );
}

function SectionHeader({ title, action, onAction }: { title: string; action: string; onAction: () => void }) {
  return <div className="section-header"><h2>{title}</h2><button onClick={onAction}>⌘ {action}</button></div>;
}

function EmptyState({ title }: { title: string }) {
  return <div className="empty-state"><span>♡</span><b>{title}</b><p>Bấm biểu tượng trái tim ở hồ sơ để lưu lại.</p></div>;
}
