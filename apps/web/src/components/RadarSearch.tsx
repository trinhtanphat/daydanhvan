import type { CSSProperties } from "react";
import type { Teacher } from "@daydanhvan/contracts";

const positions = [
  { x: 49, y: 8 }, { x: 82, y: 24 }, { x: 15, y: 36 }, { x: 83, y: 62 }, { x: 49, y: 78 }, { x: 18, y: 72 }
];

export function RadarSearch({ teachers }: { teachers: Teacher[] }) {
  return (
    <section className="radar-wrap" aria-label="Bản đồ tìm giáo viên gần bạn">
      <div className="radar">
        <div className="radar-ring ring-1" />
        <div className="radar-ring ring-2" />
        <div className="radar-ring ring-3" />
        <div className="radar-sweep" />
        <div className="radar-center"><span>⌖</span></div>
        {teachers.slice(0, 6).map((teacher, index) => {
          const pos = positions[index] ?? positions[0]!;
          const style = { "--x": `${pos.x}%`, "--y": `${pos.y}%` } as CSSProperties;
          return (
            <div className="radar-person" style={style} key={teacher.id}>
              <span>{teacher.name.split(" ").at(-1)?.[0]}</span>
              <small>{teacher.distanceKm.toFixed(1)} km</small>
            </div>
          );
        })}
      </div>
      <p className="radar-status"><b>Đang tìm kiếm...</b><br />Đã tìm thấy {teachers.length} cô giáo quanh bạn</p>
    </section>
  );
}
