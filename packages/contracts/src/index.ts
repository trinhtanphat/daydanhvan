import { z } from "zod";

export const TeacherSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number().int().min(18),
  distanceKm: z.number().nonnegative(),
  verified: z.boolean(),
  specialty: z.string(),
  district: z.string(),
  avatarUrl: z.string().url().nullable().optional(),
  online: z.boolean(),
  rating: z.number().min(0).max(5).optional(),
  bio: z.string().optional(),
  experienceYears: z.number().int().nonnegative().optional()
});

export const TeacherListResponseSchema = z.object({
  teachers: z.array(TeacherSchema),
  meta: z.object({
    approximateLocation: z.boolean(),
    count: z.number().int().nonnegative()
  })
});

export const HealthResponseSchema = z.object({
  ok: z.literal(true),
  service: z.literal("daydanhvan-api"),
  version: z.string()
});

export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  body: z.string().min(1).max(4000),
  createdAt: z.string()
});

export const ConversationSchema = z.object({
  id: z.string(),
  teacherId: z.string(),
  teacherName: z.string(),
  lastMessage: z.string(),
  updatedAt: z.string(),
  unreadCount: z.number().int().nonnegative()
});

export type Teacher = z.infer<typeof TeacherSchema>;
export type TeacherListResponse = z.infer<typeof TeacherListResponseSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
