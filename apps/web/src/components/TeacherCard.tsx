import type { Teacher } from "@daydanhvan/contracts";

const initials = (name: string) => name.split(" ").slice(-2).map((part) => part[0]).join("");

export function TeacherCard({ teacher, favorite, onFavorite, onOpen }: {
  teacher: Teacher;
  favorite: boolean;
  onFavorite: () => void;
  onOpen: () => void;
}) {
  return (
    <article className="teacher-card">
      <button className={`favorite-button ${favorite ? "is-favorite" : ""}`} onClick={onFavorite} aria-label={`${favorite ? "Bỏ" : "Thêm"} yêu thích ${teacher.name}`}>
        {favorite ? "♥" : "♡"}
      </button>
      <button className="teacher-open" onClick={onOpen}>
        <div className="teacher-photo" aria-hidden="true">
          <span>{initials(teacher.name)}</span>
          <i className={teacher.online ? "online-dot" : "offline-dot"} />
        </div>
        <div className="teacher-name-row">
          <strong>{teacher.name}</strong>
          {teacher.verified && <span className="verified" title="Đã xác minh">✓</span>}
        </div>
        <span className="teacher-meta">{teacher.age} tuổi · {teacher.district}</span>
        <span className="teacher-distance">⌖ {teacher.distanceKm.toFixed(1)} km</span>
        <div className="teacher-tags">
          <span>♡ Nhiệt tình</span>
          <span>✦ {teacher.specialty}</span>
        </div>
      </button>
    </article>
  );
}
