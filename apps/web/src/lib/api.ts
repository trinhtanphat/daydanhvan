import { TeacherListResponseSchema, type Teacher } from "@daydanhvan/contracts";

export const fallbackTeachers: Teacher[] = [
  { id: "mai-anh", name: "Mai Anh", age: 24, distanceKm: 0.6, verified: true, specialty: "Đánh vần nền tảng", district: "Cầu Giấy", avatarUrl: null, online: true, rating: 4.9, experienceYears: 3, bio: "Kiên nhẫn, vui vẻ và tập trung phát âm rõ." },
  { id: "phuong-linh", name: "Phương Linh", age: 23, distanceKm: 1.2, verified: true, specialty: "Tiền tiểu học", district: "Cầu Giấy", avatarUrl: null, online: true, rating: 4.8, experienceYears: 2, bio: "Học qua trò chơi chữ và ghép vần theo nhịp riêng." },
  { id: "thu-ha", name: "Thu Hà", age: 25, distanceKm: 1.8, verified: true, specialty: "Luyện đọc rõ tiếng", district: "Ba Đình", avatarUrl: null, online: false, rating: 4.9, experienceYears: 4, bio: "Sửa phát âm và nâng dần tốc độ đọc." },
  { id: "khanh-linh", name: "Khánh Linh", age: 24, distanceKm: 2.3, verified: true, specialty: "Ghép vần & chính tả", district: "Đống Đa", avatarUrl: null, online: true, rating: 4.7, experienceYears: 3, bio: "Kết hợp thẻ từ, kể chuyện và chính tả ngắn." },
  { id: "hong-nhung", name: "Hồng Nhung", age: 26, distanceKm: 2.7, verified: true, specialty: "Đọc hiểu cơ bản", district: "Nam Từ Liêm", avatarUrl: null, online: true, rating: 4.8, experienceYears: 5, bio: "Xây nền đọc đúng trước, sau đó luyện hiểu ý." },
  { id: "thanh-truc", name: "Thanh Trúc", age: 22, distanceKm: 3.1, verified: false, specialty: "Làm quen chữ cái", district: "Thanh Xuân", avatarUrl: null, online: false, rating: 4.6, experienceYears: 2, bio: "Làm quen mặt chữ và ghép tiếng bằng hoạt động ngắn." }
];

export async function fetchTeachers(params?: { maxDistanceKm?: number; verified?: boolean }): Promise<Teacher[]> {
  const search = new URLSearchParams();
  if (params?.maxDistanceKm) search.set("maxDistanceKm", String(params.maxDistanceKm));
  if (params?.verified) search.set("verified", "true");
  const response = await fetch(`/api/v1/teachers${search.size ? `?${search}` : ""}`);
  if (!response.ok) throw new Error(`Teacher API returned ${response.status}`);
  const parsed = TeacherListResponseSchema.parse(await response.json());
  return parsed.teachers;
}
