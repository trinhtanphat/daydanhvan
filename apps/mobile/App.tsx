import { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import type { Teacher } from "@daydanhvan/contracts";
import { loadMobileTeachers, mobileFallbackTeachers } from "./src/api";
import { mobileTheme as t } from "./src/theme";

type Tab = "home" | "search" | "messages" | "favorites" | "account";
const tabs: Array<[Tab, string, string]> = [
  ["home", "⌂", "Trang chủ"],
  ["search", "⌕", "Tìm kiếm"],
  ["messages", "✉", "Tin nhắn"],
  ["favorites", "♡", "Yêu thích"],
  ["account", "○", "Tài khoản"]
];

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [teachers, setTeachers] = useState<Teacher[]>(mobileFallbackTeachers);
  const [favoriteIds, setFavoriteIds] = useState(new Set(["mai-anh", "thu-ha"]));

  useEffect(() => { loadMobileTeachers().then(setTeachers).catch(() => undefined); }, []);
  const favorites = useMemo(() => teachers.filter((teacher) => favoriteIds.has(teacher.id)), [teachers, favoriteIds]);

  const toggleFavorite = (id: string) => setFavoriteIds((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.menu}>☰</Text>
        <View style={styles.brand}><Text style={styles.brandTitle}>Dạy đánh vần</Text><Text style={styles.brandSub}>Tìm cô giáo phù hợp quanh bạn</Text></View>
        <Text style={styles.menu}>♢</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === "home" && <Home teachers={teachers} favoriteIds={favoriteIds} toggleFavorite={toggleFavorite} onSearch={() => setTab("search")} />}
        {tab === "search" && <Search teachers={teachers} />}
        {tab === "messages" && <SimplePage eyebrow="TRÒ CHUYỆN" title="Tin nhắn" body="Trao đổi mục tiêu học, lịch thử và lộ trình với giáo viên." />}
        {tab === "favorites" && <View><PageTitle eyebrow="DANH SÁCH CỦA BẠN" title="Yêu thích" body="Những cô giáo bạn đã lưu lại." />{favorites.map((teacher) => <TeacherRow key={teacher.id} teacher={teacher} favorite onFavorite={() => toggleFavorite(teacher.id)} />)}</View>}
        {tab === "account" && <View><PageTitle eyebrow="TÀI KHOẢN" title="Phụ huynh học viên" body="Cầu Giấy, Hà Nội" /><View style={styles.accountCard}><AccountRow icon="◎" title="Thông tin tài khoản" /><AccountRow icon="⌖" title="Quyền vị trí" /><AccountRow icon="♢" title="Thông báo" /><AccountRow icon="?" title="An toàn & báo cáo" /></View></View>}
      </ScrollView>

      <View style={styles.nav}>{tabs.map(([id, icon, label]) => <TouchableOpacity key={id} style={styles.navItem} onPress={() => setTab(id)}><Text style={[styles.navIcon, tab === id && styles.active]}>{icon}</Text><Text style={[styles.navLabel, tab === id && styles.active]}>{label}</Text></TouchableOpacity>)}</View>
    </SafeAreaView>
  );
}

function Home({ teachers, favoriteIds, toggleFavorite, onSearch }: { teachers: Teacher[]; favoriteIds: Set<string>; toggleFavorite: (id: string) => void; onSearch: () => void }) {
  return <View><View style={styles.location}><Text style={styles.locationText}>⌖ Cầu Giấy, Hà Nội⌄</Text><Text style={styles.locationAction}>✥ Cập nhật vị trí</Text></View><View style={styles.hero}><Text style={styles.eyebrow}>HỌC GẦN NHÀ · DỄ KẾT NỐI</Text><Text style={styles.heroTitle}>Tìm cô giáo gần bạn</Text><Text style={styles.heroBody}>Học cùng cô giáo tận tâm và ở ngay quanh khu vực của bạn.</Text><TouchableOpacity style={styles.primary} onPress={onSearch}><Text style={styles.primaryText}>Tìm cô phù hợp</Text></TouchableOpacity><View style={styles.heroBubble}><Text style={styles.heroBubbleText}>A · Ă · Â</Text></View></View><View style={styles.sectionRow}><Text style={styles.sectionTitle}>Cô giáo quanh bạn</Text><Text style={styles.filter}>⌘ Bộ lọc</Text></View>{teachers.map((teacher) => <TeacherRow key={teacher.id} teacher={teacher} favorite={favoriteIds.has(teacher.id)} onFavorite={() => toggleFavorite(teacher.id)} />)}</View>;
}

function Search({ teachers }: { teachers: Teacher[] }) {
  return <View><PageTitle eyebrow="TÌM QUANH BẠN" title="Tìm kiếm" body={`Đã tìm thấy ${teachers.length} cô giáo trong khu vực gần bạn.`} /><View style={styles.radar}><View style={styles.ringLarge} /><View style={styles.ringMid} /><View style={styles.ringSmall} /><View style={styles.radarCenter}><Text style={styles.radarCenterText}>⌖</Text></View><Text style={[styles.dot, { top: 28, left: 122 }]}>M</Text><Text style={[styles.dot, { top: 83, right: 38 }]}>L</Text><Text style={[styles.dot, { bottom: 45, left: 38 }]}>H</Text></View>{teachers.map((teacher) => <TeacherRow key={teacher.id} teacher={teacher} favorite={false} onFavorite={() => undefined} />)}</View>;
}

function TeacherRow({ teacher, favorite, onFavorite }: { teacher: Teacher; favorite: boolean; onFavorite: () => void }) {
  return <View style={styles.teacher}><View style={styles.avatar}><Text style={styles.avatarText}>{teacher.name.split(" ").at(-1)?.[0]}</Text><View style={[styles.status, !teacher.online && styles.offline]} /></View><View style={styles.teacherMain}><View style={styles.teacherNameRow}><Text style={styles.teacherName}>{teacher.name}</Text>{teacher.verified && <Text style={styles.check}>✓</Text>}</View><Text style={styles.teacherMeta}>{teacher.age} tuổi · {teacher.district}</Text><Text style={styles.specialty}>{teacher.specialty}</Text></View><View style={styles.teacherRight}><TouchableOpacity onPress={onFavorite}><Text style={[styles.heart, favorite && styles.active]}>{favorite ? "♥" : "♡"}</Text></TouchableOpacity><Text style={styles.distance}>⌖ {teacher.distanceKm.toFixed(1)} km</Text></View></View>;
}

function PageTitle({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) { return <View style={styles.pageTitle}><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.pageHeading}>{title}</Text><Text style={styles.pageBody}>{body}</Text></View>; }
function SimplePage(props: { eyebrow: string; title: string; body: string }) { return <View><PageTitle {...props} /><View style={styles.empty}><Text style={styles.emptyIcon}>✉</Text><Text style={styles.emptyTitle}>Sẵn sàng trò chuyện</Text><Text style={styles.emptyBody}>Tin nhắn realtime sẽ dùng cùng API Worker và Durable Object.</Text></View></View>; }
function AccountRow({ icon, title }: { icon: string; title: string }) { return <View style={styles.accountRow}><Text style={styles.accountIcon}>{icon}</Text><Text style={styles.accountTitle}>{title}</Text><Text style={styles.arrow}>›</Text></View>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.background },
  header: { height: 62, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.border, backgroundColor: t.surface },
  menu: { width: 34, color: "#5e5056", fontSize: 20 },
  brand: { alignItems: "center" }, brandTitle: { color: t.brand, fontSize: 19, fontWeight: "800", fontStyle: "italic" }, brandSub: { color: t.muted, fontSize: 8, marginTop: 2 },
  content: { paddingHorizontal: 16, paddingBottom: 95 },
  location: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 14 }, locationText: { fontSize: 11, color: "#66585f" }, locationAction: { fontSize: 10, color: t.brand },
  hero: { backgroundColor: "#ffeaf1", borderRadius: 24, padding: 20, minHeight: 190, overflow: "hidden" }, eyebrow: { color: t.brand, fontSize: 9, fontWeight: "800", letterSpacing: 1 }, heroTitle: { fontSize: 25, fontWeight: "800", color: t.text, marginTop: 7 }, heroBody: { color: "#78666e", fontSize: 11, lineHeight: 17, width: "70%", marginTop: 7 }, primary: { backgroundColor: t.brand, borderRadius: 22, paddingVertical: 10, paddingHorizontal: 16, alignSelf: "flex-start", marginTop: 14 }, primaryText: { color: "white", fontWeight: "700", fontSize: 11 }, heroBubble: { position: "absolute", right: -12, bottom: -8, width: 130, height: 130, borderRadius: 65, backgroundColor: "#f4a1bd", alignItems: "center", justifyContent: "center", opacity: .9 }, heroBubbleText: { color: "white", fontWeight: "800", fontSize: 19 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 23, marginBottom: 8 }, sectionTitle: { fontSize: 17, fontWeight: "800", color: t.text }, filter: { fontSize: 10, color: t.brand },
  teacher: { flexDirection: "row", alignItems: "center", backgroundColor: t.surface, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, padding: 11, marginBottom: 10 }, avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: "#f8dce5", alignItems: "center", justifyContent: "center" }, avatarText: { color: "#bb4b71", fontSize: 21, fontWeight: "800" }, status: { position: "absolute", bottom: 2, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: "#2dbb75", borderWidth: 2, borderColor: "white" }, offline: { backgroundColor: "#c7b7bd" }, teacherMain: { flex: 1, paddingLeft: 11 }, teacherNameRow: { flexDirection: "row", alignItems: "center" }, teacherName: { fontSize: 13, fontWeight: "800", color: t.text }, check: { color: t.brand, marginLeft: 5, fontWeight: "800" }, teacherMeta: { color: t.muted, fontSize: 9, marginTop: 4 }, specialty: { color: "#bd6b36", fontSize: 8, marginTop: 7 }, teacherRight: { alignItems: "flex-end", justifyContent: "space-between", minHeight: 54 }, heart: { fontSize: 20, color: "#bbaab1" }, active: { color: t.brand }, distance: { fontSize: 8, color: t.brand },
  nav: { position: "absolute", bottom: 0, left: 0, right: 0, height: 70, backgroundColor: "rgba(255,255,255,0.98)", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border, flexDirection: "row", paddingBottom: 8 }, navItem: { flex: 1, alignItems: "center", justifyContent: "center" }, navIcon: { fontSize: 19, color: "#9f9096" }, navLabel: { fontSize: 8, color: "#9f9096", marginTop: 2 },
  pageTitle: { paddingVertical: 24 }, pageHeading: { fontSize: 28, fontWeight: "800", color: t.text, marginTop: 6 }, pageBody: { fontSize: 11, lineHeight: 17, color: t.muted, marginTop: 7 },
  radar: { alignSelf: "center", width: 270, height: 270, borderRadius: 135, backgroundColor: "#fff3f7", alignItems: "center", justifyContent: "center", marginBottom: 22 }, ringLarge: { position: "absolute", width: 230, height: 230, borderRadius: 115, borderWidth: 1, borderColor: "#f4c9d7" }, ringMid: { position: "absolute", width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: "#f1bacd" }, ringSmall: { position: "absolute", width: 88, height: 88, borderRadius: 44, borderWidth: 1, borderColor: "#eca6be" }, radarCenter: { width: 36, height: 36, borderRadius: 18, backgroundColor: t.brand, alignItems: "center", justifyContent: "center" }, radarCenterText: { color: "white" }, dot: { position: "absolute", width: 35, height: 35, borderRadius: 18, textAlign: "center", textAlignVertical: "center", backgroundColor: "white", color: t.brand, fontWeight: "800", overflow: "hidden" },
  empty: { alignItems: "center", paddingVertical: 70 }, emptyIcon: { fontSize: 42, color: "#e89ab5" }, emptyTitle: { fontWeight: "800", marginTop: 12, color: t.text }, emptyBody: { color: t.muted, fontSize: 10, textAlign: "center", marginTop: 6 },
  accountCard: { backgroundColor: "white", borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, overflow: "hidden" }, accountRow: { flexDirection: "row", alignItems: "center", padding: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.border }, accountIcon: { width: 34, color: t.brand }, accountTitle: { flex: 1, color: t.text, fontSize: 12, fontWeight: "600" }, arrow: { color: "#b4a4aa", fontSize: 20 }
});
