export type TabId = "home" | "search" | "messages" | "favorites" | "account";

const items: Array<{ id: TabId; icon: string; label: string }> = [
  { id: "home", icon: "⌂", label: "Trang chủ" },
  { id: "search", icon: "⌕", label: "Tìm kiếm" },
  { id: "messages", icon: "✉", label: "Tin nhắn" },
  { id: "favorites", icon: "♡", label: "Yêu thích" },
  { id: "account", icon: "○", label: "Tài khoản" }
];

export function BottomNav({ active, onChange }: { active: TabId; onChange: (tab: TabId) => void }) {
  return (
    <nav className="bottom-nav" aria-label="Điều hướng chính">
      {items.map((item) => (
        <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => onChange(item.id)}>
          <span>{item.icon}</span>
          <small>{item.label}</small>
        </button>
      ))}
    </nav>
  );
}
