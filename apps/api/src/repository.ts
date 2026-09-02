import type { Conversation, Teacher } from "@daydanhvan/contracts";

export type TeacherRecord = Teacher & {
  serviceLat: number | null;
  serviceLng: number | null;
};

type TeacherRow = {
  id: string;
  name: string;
  age: number;
  specialty: string;
  bio: string;
  experience_years: number;
  verified: number;
  online: number;
  rating: number | null;
  district: string;
  public_lat: number | null;
  public_lng: number | null;
};

export async function loadTeachersFromDb(db: D1Database): Promise<TeacherRecord[]> {
  const result = await db.prepare(
    "SELECT u.id AS id, u.display_name AS name, tp.age AS age, tp.specialty AS specialty, tp.bio AS bio, tp.experience_years AS experience_years, tp.verified AS verified, tp.online AS online, tp.rating AS rating, tsa.district AS district, tsa.public_lat AS public_lat, tsa.public_lng AS public_lng FROM teacher_profiles tp JOIN users u ON u.id = tp.user_id LEFT JOIN teacher_service_areas tsa ON tsa.teacher_id = tp.user_id WHERE tp.moderation_status != 'rejected' ORDER BY tp.verified DESC, u.display_name ASC"
  ).all<TeacherRow>();

  return result.results.map((row) => ({
    id: row.id,
    name: row.name,
    age: row.age,
    distanceKm: 0,
    verified: row.verified === 1,
    specialty: row.specialty,
    district: row.district ?? "Hà Nội",
    avatarUrl: null,
    online: row.online === 1,
    rating: row.rating ?? undefined,
    bio: row.bio,
    experienceYears: row.experience_years,
    serviceLat: row.public_lat,
    serviceLng: row.public_lng
  }));
}

export async function loadTeacherFromDb(db: D1Database, id: string): Promise<TeacherRecord | null> {
  const row = await db.prepare(
    "SELECT u.id AS id, u.display_name AS name, tp.age AS age, tp.specialty AS specialty, tp.bio AS bio, tp.experience_years AS experience_years, tp.verified AS verified, tp.online AS online, tp.rating AS rating, tsa.district AS district, tsa.public_lat AS public_lat, tsa.public_lng AS public_lng FROM teacher_profiles tp JOIN users u ON u.id = tp.user_id LEFT JOIN teacher_service_areas tsa ON tsa.teacher_id = tp.user_id WHERE u.id = ? LIMIT 1"
  ).bind(id).first<TeacherRow>();
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    distanceKm: 0,
    verified: row.verified === 1,
    specialty: row.specialty,
    district: row.district ?? "Hà Nội",
    avatarUrl: null,
    online: row.online === 1,
    rating: row.rating ?? undefined,
    bio: row.bio,
    experienceYears: row.experience_years,
    serviceLat: row.public_lat,
    serviceLng: row.public_lng
  };
}

export async function loadConversationsFromDb(db: D1Database, userId: string): Promise<Conversation[]> {
  const result = await db.prepare(
    "SELECT c.id AS id, teacher.id AS teacher_id, teacher.display_name AS teacher_name, COALESCE((SELECT body FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1), '') AS last_message, c.updated_at AS updated_at FROM conversations c JOIN conversation_members mine ON mine.conversation_id = c.id AND mine.user_id = ? JOIN conversation_members other ON other.conversation_id = c.id AND other.user_id != ? JOIN users teacher ON teacher.id = other.user_id AND teacher.role = 'teacher' ORDER BY c.updated_at DESC"
  ).bind(userId, userId).all<{ id: string; teacher_id: string; teacher_name: string; last_message: string; updated_at: string }>();

  return result.results.map((row) => ({
    id: row.id,
    teacherId: row.teacher_id,
    teacherName: row.teacher_name,
    lastMessage: row.last_message,
    updatedAt: row.updated_at,
    unreadCount: 0
  }));
}
