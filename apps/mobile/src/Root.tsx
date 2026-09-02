import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import App from "../App";
import { checkApiHealth } from "./api";

export default function Root() {
  const [status, setStatus] = useState<"connecting" | "online" | "offline">("connecting");

  useEffect(() => {
    let active = true;
    checkApiHealth().then((health) => {
      if (active) setStatus(health ? "online" : "offline");
    });
    return () => { active = false; };
  }, []);

  const label = status === "online"
    ? "● Đã kết nối máy chủ"
    : status === "offline"
      ? "● Ngoại tuyến · đang dùng dữ liệu dự phòng"
      : "● Đang kết nối daydanhvan.qs3d.site";

  return (
    <View style={styles.shell}>
      <View style={[styles.banner, status === "offline" && styles.offline]}>
        <Text style={styles.text}>{label}</Text>
      </View>
      <View style={styles.app}><App /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#fffafb" },
  app: { flex: 1 },
  banner: { minHeight: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#eefaf4", paddingHorizontal: 12 },
  offline: { backgroundColor: "#fff1f4" },
  text: { fontSize: 9, fontWeight: "700", color: "#6d5961" }
});
