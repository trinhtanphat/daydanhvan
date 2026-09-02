import { TeacherListResponseSchema, type Teacher } from "@daydanhvan/contracts";
import { getApiBaseUrl, getHealthUrl } from "./config";

export const mobileFallbackTeachers: Teacher[] = [
  { id: "mai-anh", name: "Mai Anh", age: 24, distanceKm: 0.6, verified: true, specialty: "Đánh vần nền tảng", district: "Cầu Giấy", avatarUrl: null, online: true, rating: 4.9 },
  { id: "phuong-linh", name: "Phương Linh", age: 23, distanceKm: 1.2, verified: true, specialty: "Tiền tiểu học", district: "Cầu Giấy", avatarUrl: null, online: true, rating: 4.8 },
  { id: "thu-ha", name: "Thu Hà", age: 25, distanceKm: 1.8, verified: true, specialty: "Luyện đọc rõ tiếng", district: "Ba Đình", avatarUrl: null, online: false, rating: 4.9 },
  { id: "khanh-linh", name: "Khánh Linh", age: 24, distanceKm: 2.3, verified: true, specialty: "Ghép vần & chính tả", district: "Đống Đa", avatarUrl: null, online: true, rating: 4.7 }
];

export type ApiHealth = {
  ok: boolean;
  service: string;
  version: string;
};

export async function checkApiHealth(): Promise<ApiHealth | null> {
  try {
    const response = await fetch(getHealthUrl(), { headers: { Accept: "application/json" } });
    if (!response.ok) return null;
    const payload = await response.json() as Partial<ApiHealth>;
    if (payload.ok !== true || payload.service !== "daydanhvan-api" || typeof payload.version !== "string") return null;
    return { ok: true, service: payload.service, version: payload.version };
  } catch {
    return null;
  }
}

export async function loadMobileTeachers(): Promise<Teacher[]> {
  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/v1/teachers`, { headers: { Accept: "application/json" } });
    if (!response.ok) return mobileFallbackTeachers;
    return TeacherListResponseSchema.parse(await response.json()).teachers;
  } catch {
    return mobileFallbackTeachers;
  }
}
