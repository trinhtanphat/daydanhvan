INSERT OR IGNORE INTO users (id, display_name, role) VALUES
  ('demo-user', 'Phụ huynh học viên', 'parent'),
  ('mai-anh', 'Mai Anh', 'teacher'),
  ('phuong-linh', 'Phương Linh', 'teacher'),
  ('thu-ha', 'Thu Hà', 'teacher'),
  ('khanh-linh', 'Khánh Linh', 'teacher'),
  ('hong-nhung', 'Hồng Nhung', 'teacher'),
  ('thanh-truc', 'Thanh Trúc', 'teacher');

INSERT OR IGNORE INTO teacher_profiles (user_id, age, specialty, bio, experience_years, verified, online, rating, moderation_status) VALUES
  ('mai-anh', 24, 'Đánh vần nền tảng', 'Kiên nhẫn, vui vẻ, tập trung phát âm và tạo hứng thú đọc cho trẻ.', 3, 1, 1, 4.9, 'approved'),
  ('phuong-linh', 23, 'Tiền tiểu học', 'Học qua trò chơi chữ, luyện âm đầu và ghép vần theo nhịp độ riêng của từng bé.', 2, 1, 1, 4.8, 'approved'),
  ('thu-ha', 25, 'Luyện đọc rõ tiếng', 'Ưu tiên nhịp học nhẹ nhàng, sửa phát âm và nâng dần tốc độ đọc.', 4, 1, 0, 4.9, 'approved'),
  ('khanh-linh', 24, 'Ghép vần & chính tả', 'Kết hợp thẻ từ, kể chuyện ngắn và bài tập chính tả phù hợp lứa tuổi.', 3, 1, 1, 4.7, 'approved'),
  ('hong-nhung', 26, 'Đọc hiểu cơ bản', 'Xây nền đọc đúng trước, sau đó luyện hiểu ý và diễn đạt câu ngắn.', 5, 1, 1, 4.8, 'approved'),
  ('thanh-truc', 22, 'Làm quen chữ cái', 'Làm quen mặt chữ, âm thanh và ghép tiếng bằng hoạt động ngắn, dễ nhớ.', 2, 0, 0, 4.6, 'pending');

INSERT OR IGNORE INTO teacher_service_areas (id, teacher_id, district, public_lat, public_lng, precision_level) VALUES
  ('area-mai-anh', 'mai-anh', 'Cầu Giấy', 21.0368, 105.7909, 'meeting_point'),
  ('area-phuong-linh', 'phuong-linh', 'Cầu Giấy', 21.0315, 105.7954, 'meeting_point'),
  ('area-thu-ha', 'thu-ha', 'Ba Đình', 21.0404, 105.8041, 'meeting_point'),
  ('area-khanh-linh', 'khanh-linh', 'Đống Đa', 21.0267, 105.8174, 'meeting_point'),
  ('area-hong-nhung', 'hong-nhung', 'Nam Từ Liêm', 21.0289, 105.7756, 'meeting_point'),
  ('area-thanh-truc', 'thanh-truc', 'Thanh Xuân', 20.9991, 105.8102, 'meeting_point');

INSERT OR IGNORE INTO favorites (user_id, teacher_id) VALUES
  ('demo-user', 'mai-anh'),
  ('demo-user', 'thu-ha');

INSERT OR IGNORE INTO conversations (id, created_at, updated_at) VALUES
  ('conv-mai-anh', '2026-09-02T04:30:00.000Z', '2026-09-02T04:35:00.000Z'),
  ('conv-phuong-linh', '2026-09-01T14:00:00.000Z', '2026-09-01T14:10:00.000Z');

INSERT OR IGNORE INTO conversation_members (conversation_id, user_id) VALUES
  ('conv-mai-anh', 'demo-user'),
  ('conv-mai-anh', 'mai-anh'),
  ('conv-phuong-linh', 'demo-user'),
  ('conv-phuong-linh', 'phuong-linh');

INSERT OR IGNORE INTO messages (id, conversation_id, sender_id, body, created_at) VALUES
  ('msg-1', 'conv-mai-anh', 'mai-anh', 'Chào chị, bé đang nhận biết được khoảng bao nhiêu chữ cái rồi ạ?', '2026-09-02T04:31:00.000Z'),
  ('msg-2', 'conv-mai-anh', 'demo-user', 'Bé nhận biết gần hết nhưng ghép vần còn chậm em nhé.', '2026-09-02T04:33:00.000Z'),
  ('msg-3', 'conv-mai-anh', 'mai-anh', 'Mình có thể học thử vào chiều thứ Bảy nhé.', '2026-09-02T04:35:00.000Z'),
  ('msg-4', 'conv-phuong-linh', 'phuong-linh', 'Em gửi chị lộ trình 4 buổi đầu ạ.', '2026-09-01T14:10:00.000Z');
