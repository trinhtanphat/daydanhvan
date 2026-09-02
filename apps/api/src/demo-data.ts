import type { Conversation, Message, Teacher } from "@daydanhvan/contracts";

export type DemoTeacher = Teacher & { serviceLat: number; serviceLng: number };

export const demoTeachers: DemoTeacher[] = [
  {
    id: "mai-anh",
    name: "Mai Anh",
    age: 24,
    distanceKm: 0.6,
    verified: true,
    specialty: "Đánh vần nền tảng",
    district: "Cầu Giấy",
    avatarUrl: null,
    online: true,
    rating: 4.9,
    bio: "Kiên nhẫn, vui vẻ, tập trung phát âm và tạo hứng thú đọc cho trẻ.",
    experienceYears: 3,
    serviceLat: 21.0368,
    serviceLng: 105.7909
  },
  {
    id: "phuong-linh",
    name: "Phương Linh",
    age: 23,
    distanceKm: 1.2,
    verified: true,
    specialty: "Tiền tiểu học",
    district: "Cầu Giấy",
    avatarUrl: null,
    online: true,
    rating: 4.8,
    bio: "Học qua trò chơi chữ, luyện âm đầu và ghép vần theo nhịp độ riêng của từng bé.",
    experienceYears: 2,
    serviceLat: 21.0315,
    serviceLng: 105.7954
  },
  {
    id: "thu-ha",
    name: "Thu Hà",
    age: 25,
    distanceKm: 1.8,
    verified: true,
    specialty: "Luyện đọc rõ tiếng",
    district: "Ba Đình",
    avatarUrl: null,
    online: false,
    rating: 4.9,
    bio: "Ưu tiên nhịp học nhẹ nhàng, sửa phát âm và nâng dần tốc độ đọc.",
    experienceYears: 4,
    serviceLat: 21.0404,
    serviceLng: 105.8041
  },
  {
    id: "khanh-linh",
    name: "Khánh Linh",
    age: 24,
    distanceKm: 2.3,
    verified: true,
    specialty: "Ghép vần & chính tả",
    district: "Đống Đa",
    avatarUrl: null,
    online: true,
    rating: 4.7,
    bio: "Kết hợp thẻ từ, kể chuyện ngắn và bài tập chính tả phù hợp lứa tuổi.",
    experienceYears: 3,
    serviceLat: 21.0267,
    serviceLng: 105.8174
  },
  {
    id: "hong-nhung",
    name: "Hồng Nhung",
    age: 26,
    distanceKm: 2.7,
    verified: true,
    specialty: "Đọc hiểu cơ bản",
    district: "Nam Từ Liêm",
    avatarUrl: null,
    online: true,
    rating: 4.8,
    bio: "Xây nền đọc đúng trước, sau đó luyện hiểu ý và diễn đạt câu ngắn.",
    experienceYears: 5,
    serviceLat: 21.0289,
    serviceLng: 105.7756
  },
  {
    id: "thanh-truc",
    name: "Thanh Trúc",
    age: 22,
    distanceKm: 3.1,
    verified: false,
    specialty: "Làm quen chữ cái",
    district: "Thanh Xuân",
    avatarUrl: null,
    online: false,
    rating: 4.6,
    bio: "Làm quen mặt chữ, âm thanh và ghép tiếng bằng hoạt động ngắn, dễ nhớ.",
    experienceYears: 2,
    serviceLat: 20.9991,
    serviceLng: 105.8102
  }
];

export const demoConversations: Conversation[] = [
  {
    id: "conv-mai-anh",
    teacherId: "mai-anh",
    teacherName: "Mai Anh",
    lastMessage: "Mình có thể học thử vào chiều thứ Bảy nhé.",
    updatedAt: "2026-09-02T04:35:00.000Z",
    unreadCount: 1
  },
  {
    id: "conv-phuong-linh",
    teacherId: "phuong-linh",
    teacherName: "Phương Linh",
    lastMessage: "Em gửi chị lộ trình 4 buổi đầu ạ.",
    updatedAt: "2026-09-01T14:10:00.000Z",
    unreadCount: 0
  }
];

export const demoMessages: Message[] = [
  {
    id: "msg-1",
    conversationId: "conv-mai-anh",
    senderId: "mai-anh",
    body: "Chào chị, bé đang nhận biết được khoảng bao nhiêu chữ cái rồi ạ?",
    createdAt: "2026-09-02T04:31:00.000Z"
  },
  {
    id: "msg-2",
    conversationId: "conv-mai-anh",
    senderId: "demo-user",
    body: "Bé nhận biết gần hết nhưng ghép vần còn chậm em nhé.",
    createdAt: "2026-09-02T04:33:00.000Z"
  }
];
