import { TeacherListResponseSchema, type Teacher } from "@daydanhvan/contracts";

export const mobileFallbackTeachers: Teacher[] = [
  { id: "mai-anh", name: "Mai Anh", age: 24, distanceKm: 0.6, verified: true, specialty: "Đánh vần nền tảng", district: "Cầu Giấy", avatarUrl: null, online: true, rating: 4.9 },
  { id: "phuong-linh", name: "Phương Linh", age: 23, distanceKm: 1.2, verified: true, specialty: "Tiền tiểu học", district: "Cầu Giấy", avatarUrl: null, online: true, rating: 4.8 },
  { id: "thu-ha", name: "Thu Hà", age: 25, distanceKm: 1.8, verified: true, specialty: "Luyện đọc rõ tiếng", district: "Ba Đình", avatarUrl: null, online: false, rating: 4.9 },
  { id: "khanh-linh", name: "Khánh Linh", age: 24, distanceKm: 2.3, verified: true, specialty: "Ghép vần & chính tả", district: "Đống Đa", avatarUrl: null, online: true, rating: 4.7 }
];

const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

export async function loadMobileTeachers(): Promise<Teacher[]> {
  if (!baseUrl) return mobileFallbackTeachers;
  try {
    const response = await fetch(`${baseUrl}/api/v1/teachers`);
    if (!response.ok) return mobileFallbackTeachers;
    return TeacherListResponseSchema.parse(await response.json()).teachers;
  } catch {
    return mobileFallbackTeachers;
  }
}
