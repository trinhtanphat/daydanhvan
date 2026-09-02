import { Hono } from "hono";
import {
  HealthResponseSchema,
  MessageSchema,
  TeacherListResponseSchema,
  TeacherSchema,
  type Message,
  type Teacher
} from "@daydanhvan/contracts";
import { demoConversations, demoMessages, demoTeachers } from "./demo-data";
import { haversineKm, roundDistanceKm } from "./distance";
import {
  loadConversationsFromDb,
  loadTeacherFromDb,
  loadTeachersFromDb,
  type TeacherRecord
} from "./repository";

export { ChatRoom } from "./chat-room";

export type Bindings = {
  DB?: D1Database;
  MEDIA?: R2Bucket;
  CHAT_ROOM?: DurableObjectNamespace;
  ASSETS?: Fetcher;
  APP_VERSION?: string;
  ADMIN_API_KEY?: string;
};

const DEMO_USER_ID = "demo-user";
const DEFAULT_SEARCH_CENTER = { lat: 21.033, lng: 105.794 };
export const app = new Hono<{ Bindings: Bindings }>();

app.get("/api/v1/health", (c) => {
  return c.json(
    HealthResponseSchema.parse({
      ok: true,
      service: "daydanhvan-api",
      version: c.env.APP_VERSION ?? "0.1.0"
    })
  );
});

app.get("/api/v1/teachers", async (c) => {
  const queryLat = Number(c.req.query("lat"));
  const queryLng = Number(c.req.query("lng"));
  const maxDistance = Number(c.req.query("maxDistanceKm") ?? "0");
  const verifiedOnly = c.req.query("verified") === "true";
  const hasLocation = Number.isFinite(queryLat) && Number.isFinite(queryLng) && c.req.query("lat") !== undefined && c.req.query("lng") !== undefined;
  const origin = hasLocation ? { lat: queryLat, lng: queryLng } : DEFAULT_SEARCH_CENTER;

  let source: TeacherRecord[];
  if (c.env.DB) {
    try {
      source = await loadTeachersFromDb(c.env.DB);
      if (source.length === 0) throw new Error("empty_teacher_store");
    } catch {
      source = demoTeachers;
    }
  } else {
    source = demoTeachers;
  }

  let teachers: Teacher[] = source.map(({ serviceLat, serviceLng, ...teacher }) => ({
    ...teacher,
    distanceKm:
      serviceLat != null && serviceLng != null
        ? roundDistanceKm(haversineKm(origin.lat, origin.lng, serviceLat, serviceLng))
        : teacher.distanceKm
  }));

  if (verifiedOnly) teachers = teachers.filter((teacher) => teacher.verified);
  if (Number.isFinite(maxDistance) && maxDistance > 0) {
    teachers = teachers.filter((teacher) => teacher.distanceKm <= maxDistance);
  }

  teachers.sort((a, b) => a.distanceKm - b.distanceKm);
  return c.json(
    TeacherListResponseSchema.parse({
      teachers,
      meta: { approximateLocation: true, count: teachers.length }
    })
  );
});

app.get("/api/v1/teachers/:id", async (c) => {
  const teacherId = c.req.param("id");
  let record: TeacherRecord | null = null;
  if (c.env.DB) {
    try {
      record = await loadTeacherFromDb(c.env.DB, teacherId);
    } catch {
      record = null;
    }
  }
  record ??= demoTeachers.find((teacher) => teacher.id === teacherId) ?? null;
  if (!record) return c.json({ error: "teacher_not_found" }, 404);
  const { serviceLat, serviceLng, ...teacher } = record;
  const distanceKm = serviceLat != null && serviceLng != null
    ? roundDistanceKm(haversineKm(DEFAULT_SEARCH_CENTER.lat, DEFAULT_SEARCH_CENTER.lng, serviceLat, serviceLng))
    : teacher.distanceKm;
  return c.json(TeacherSchema.parse({ ...teacher, distanceKm }));
});

app.get("/api/v1/favorites", async (c) => {
  if (!c.env.DB) return c.json({ teacherIds: ["mai-anh", "thu-ha"] });
  const result = await c.env.DB.prepare("SELECT teacher_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC")
    .bind(DEMO_USER_ID)
    .all<{ teacher_id: string }>();
  return c.json({ teacherIds: result.results.map((row) => row.teacher_id) });
});

app.post("/api/v1/favorites/:teacherId", async (c) => {
  const teacherId = c.req.param("teacherId");
  if (!demoTeachers.some((teacher) => teacher.id === teacherId)) {
    return c.json({ error: "teacher_not_found" }, 404);
  }
  if (c.env.DB) {
    await c.env.DB.prepare(
      "INSERT OR IGNORE INTO favorites (user_id, teacher_id, created_at) VALUES (?, ?, datetime('now'))"
    ).bind(DEMO_USER_ID, teacherId).run();
  }
  return c.json({ teacherId, favorited: true });
});

app.delete("/api/v1/favorites/:teacherId", async (c) => {
  const teacherId = c.req.param("teacherId");
  if (c.env.DB) {
    await c.env.DB.prepare("DELETE FROM favorites WHERE user_id = ? AND teacher_id = ?")
      .bind(DEMO_USER_ID, teacherId)
      .run();
  }
  return c.json({ teacherId, favorited: false });
});

app.get("/api/v1/conversations", async (c) => {
  if (!c.env.DB) return c.json({ conversations: demoConversations });
  try {
    const conversations = await loadConversationsFromDb(c.env.DB, DEMO_USER_ID);
    return c.json({ conversations: conversations.length ? conversations : demoConversations });
  } catch {
    return c.json({ conversations: demoConversations });
  }
});

app.get("/api/v1/conversations/:id/messages", async (c) => {
  const conversationId = c.req.param("id");
  if (!c.env.DB) {
    return c.json({ messages: demoMessages.filter((message) => message.conversationId === conversationId) });
  }
  const result = await c.env.DB.prepare(
    "SELECT id, conversation_id, sender_id, body, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 200"
  ).bind(conversationId).all<{ id: string; conversation_id: string; sender_id: string; body: string; created_at: string }>();
  const messages: Message[] = result.results.map((row) => MessageSchema.parse({
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at
  }));
  return c.json({ messages });
});

app.post("/api/v1/conversations/:id/messages", async (c) => {
  const conversationId = c.req.param("id");
  const payload = await c.req.json<{ body?: string }>().catch(() => ({ body: undefined }));
  const body = payload.body?.trim() ?? "";
  if (!body || body.length > 4000) return c.json({ error: "invalid_message" }, 400);

  const message = MessageSchema.parse({
    id: crypto.randomUUID(),
    conversationId,
    senderId: DEMO_USER_ID,
    body,
    createdAt: new Date().toISOString()
  });

  if (c.env.DB) {
    await c.env.DB.prepare(
      "INSERT INTO messages (id, conversation_id, sender_id, body, created_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(message.id, message.conversationId, message.senderId, message.body, message.createdAt).run();
    await c.env.DB.prepare("UPDATE conversations SET updated_at = ? WHERE id = ?")
      .bind(message.createdAt, conversationId)
      .run();
  }

  return c.json(message, 201);
});

app.get("/api/v1/ws/conversations/:id", async (c) => {
  if (!c.env.CHAT_ROOM) return c.json({ error: "realtime_not_configured" }, 503);
  const id = c.env.CHAT_ROOM.idFromName(c.req.param("id"));
  return c.env.CHAT_ROOM.get(id).fetch(c.req.raw);
});

app.get("/api/v1/admin/teachers", async (c) => {
  const adminKey = c.env.ADMIN_API_KEY;
  if (!adminKey || c.req.header("X-Admin-Key") !== adminKey) return c.json({ error: "forbidden" }, 403);

  if (!c.env.DB) {
    return c.json({
      teachers: demoTeachers.map((teacher) => ({
        id: teacher.id,
        name: teacher.name,
        verified: teacher.verified,
        moderationStatus: teacher.verified ? "approved" : "pending"
      }))
    });
  }

  const result = await c.env.DB.prepare(
    "SELECT tp.user_id AS id, u.display_name AS name, tp.verified AS verified, tp.moderation_status AS moderation_status FROM teacher_profiles tp JOIN users u ON u.id = tp.user_id ORDER BY u.display_name"
  ).all<{ id: string; name: string; verified: number; moderation_status: string }>();
  return c.json({
    teachers: result.results.map((row) => ({
      id: row.id,
      name: row.name,
      verified: row.verified === 1,
      moderationStatus: row.moderation_status
    }))
  });
});

app.post("/api/v1/admin/teachers/:id/approve", async (c) => {
  const adminKey = c.env.ADMIN_API_KEY;
  if (!adminKey || c.req.header("X-Admin-Key") !== adminKey) return c.json({ error: "forbidden" }, 403);
  const teacherId = c.req.param("id");
  if (!c.env.DB && !demoTeachers.some((teacher) => teacher.id === teacherId)) {
    return c.json({ error: "teacher_not_found" }, 404);
  }
  if (c.env.DB) {
    await c.env.DB.prepare(
      "UPDATE teacher_profiles SET verified = 1, moderation_status = 'approved' WHERE user_id = ?"
    ).bind(teacherId).run();
  }
  return c.json({ id: teacherId, verified: true, moderationStatus: "approved" });
});

app.get("/api/v1/admin/reports", async (c) => {
  const adminKey = c.env.ADMIN_API_KEY;
  if (!adminKey || c.req.header("X-Admin-Key") !== adminKey) return c.json({ error: "forbidden" }, 403);
  if (!c.env.DB) return c.json({ reports: [] });
  const result = await c.env.DB.prepare(
    "SELECT id, reason, status, target_user_id FROM reports WHERE status IN ('open','reviewing') ORDER BY created_at ASC"
  ).all<{ id: string; reason: string; status: string; target_user_id: string }>();
  return c.json({
    reports: result.results.map((row) => ({
      id: row.id,
      reason: row.reason,
      status: row.status,
      targetUserId: row.target_user_id
    }))
  });
});

app.notFound((c) => {
  if (c.env.ASSETS) return c.env.ASSETS.fetch(c.req.raw);
  return c.json({ error: "not_found" }, 404);
});

export default app;
