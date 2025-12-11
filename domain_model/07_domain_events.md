# Domain Model Specification (Stage 2) - Part 7: Domain Events

## 7. DOMAIN EVENTS (Optional but helpful)

### Story Events (เหตุการณ์เรื่อง)
- **Event**: StoryCreated (สร้างเรื่อง)
  - **When**: บันทึกฉบับร่างเรื่องใหม่
  - **Payload**: storyId, authorId, title, creationDate
  - **Downstream**: อัปเดตห้องสมุดเรื่อง แจ้งทีมผู้ดูแลระบบ

- **Event**: StoryPublished (เผยแพร่เรื่อง)
  - **When**: สถานะเรื่องเปลี่ยนเป็นเผยแพร่
  - **Payload**: storyId, publishDate, authorId, version
  - **Downstream**: อัปเดตดัชนีค้นหา แจ้งผู้สมัครสมาชิก การติดตามวิเคราะห์

- **Event**: StoryArchived (เก็บเรื่องถาวร)
  - **When**: เรื่องย้ายไปสถานะเก็บถาวร
  - **Payload**: storyId, archiveDate, reason
  - **Downstream**: อัปเดตรายการ เก็บรักษาการวิเคราะห์ แจ้งผู้ใช้ที่ได้รับผลกระทบ

### Gameplay Events (เหตุการณ์การเล่น)
- **Event**: StoryStarted (เริ่มเรื่อง)
  - **When**: ผู้ใช้เริ่มเล่นเรื่อง
  - **Payload**: userId, storyId, startTime, sessionId
  - **Downstream**: เริ่มต้นความคืบหน้า อัปเดตการวิเคราะห์ ติดตามการมีส่วนร่วม

- **Event**: ChoiceSelected (เลือกตัวเลือก)
  - **When**: ผู้ใช้เลือกตัวเลือกเรื่อง
  - **Payload**: userId, choiceId, fromSceneId, toSceneId, creditsSpent, timestamp
  - **Downstream**: หักเครดิต อัปเดตความคืบหน้า ติดตามเส้นทาง การวิเคราะห์

- **Event**: SceneCompleted (จบฉาก)
  - **When**: ผู้ใช้จบการดูฉาก
  - **Payload**: userId, sceneId, timeSpent, completionType
  - **Downstream**: อัปเดตความคืบหน้า คำนวณสถิติ การตรวจสอบความสำเร็จ

- **Event**: StoryCompleted (จบเรื่อง)
  - **When**: ผู้ใช้ถึงจุดสิ้นสุดเรื่อง
  - **Payload**: userId, storyId, endingType, completionDate, totalCreditsSpent, timeSpent
  - **Downstream**: มอบความสำเร็จ ปลดล็อกเนื้อหา อัปเดตการวิเคราะห์ ทริกเกอร์พร้อมท์การจัดอันดับ

### Credit Events (เหตุการณ์เครดิต)
- **Event**: CreditsDeducted (หักเครดิต)
  - **When**: ใช้เครดิตสำหรับตัวเลือกหรือการซื้อ
  - **Payload**: userId, amount, reason, newBalance, transactionId
  - **Downstream**: อัปเดตกระเป๋าเงิน บันทึกธุรกรรม ตรวจสอบคำเตือนยอดเงิน

- **Event**: CreditsRefilled (เติมเต็มเครดิต)
  - **When**: เกิดการเติมเต็มอัตโนมัติตามเวลา
  - **Payload**: userId, amount, refillDate, newBalance
  - **Downstream**: อัปเดตกระเป๋าเงิน ส่งการแจ้งเตือน ติดตามรูปแบบการเติมเต็ม

- **Event**: CreditsEarned (ได้รับเครดิต)
  - **When**: มอบเครดิตเป็นรางวัล
  - **Payload**: userId, amount, source (rating/achievement), newBalance
  - **Downstream**: อัปเดตกระเป๋าเงิน แจ้งผู้ใช้ การติดตามวิเคราะห์

### Achievement Events (เหตุการณ์ความสำเร็จ)
- **Event**: AchievementUnlocked (ปลดล็อกความสำเร็จ)
  - **When**: ผู้ใช้ได้ความสำเร็จใหม่
  - **Payload**: userId, achievementId, unlockDate, contextData
  - **Downstream**: มอบเครดิต ปลดล็อกอวาตาร์ ส่งการแจ้งเตือน อัปเดตโปรไฟล์

- **Event**: AchievementProgressUpdated (อัปเดตความคืบหน้าความสำเร็จ)
  - **When**: ผู้ใช้ก้าวหน้าสู่ความสำเร็จ
  - **Payload**: userId, achievementId, progressPercentage, progressData
  - **Downstream**: อัปเดตการแสดงความคืบหน้า ตรวจสอบการเสร็จสิ้น การวิเคราะห์

### Rating & Review Events (เหตุการณ์การจัดอันดับและรีวิว)
- **Event**: StoryRated (จัดอันดับเรื่อง)
  - **When**: ผู้ใช้ส่งการจัดอันดับดาว
  - **Payload**: userId, storyId, rating, ratingDate, context
  - **Downstream**: อัปเดตค่าเฉลี่ยเรื่อง มอบเครดิต รีเฟรชคำแนะนำ

- **Event**: ReviewSubmitted (ส่งรีวิว)
  - **When**: ผู้ใช้เขียนรีวิว
  - **Payload**: userId, storyId, reviewId, reviewText, submissionDate
  - **Downstream**: จัดคิวสำหรับการตรวจสอบ แจ้งผู้เขียน อัปเดตรายละเอียดเรื่อง

- **Event**: ReviewModerated (ตรวจสอบรีวิว)
  - **When**: ผู้ดูแลระบบประมวลผลรีวิว
  - **Payload**: reviewId, moderatorId, action, moderationDate, notes
  - **Downstream**: อัปเดตสถานะรีวิว แจ้งผู้ใช้ อัปเดตการแสดงเรื่อง

### Admin Events (เหตุการณ์ผู้ดูแลระบบ)
- **Event**: AdminActionPerformed (การกระทำผู้ดูแลระบบ)
  - **When**: ผู้ดูแลระบบดำเนินการผู้ดูแลระบบ
  - **Payload**: adminId, actionType, targetType, targetId, timestamp, details
  - **Downstream**: บันทึกการกระทำ อัปเดตร่องรอยการตรวจสอบ แจ้งผู้ใช้ที่ได้รับผลกระทบ

- **Event**: ContentValidated (ตรวจสอบเนื้อหา)
  - **When**: เสร็จสิ้นการตรวจสอบเนื้อหาเรื่อง
  - **Payload**: storyId, validationResult, validationDate, validatorId
  - **Downstream**: อัปเดตสถานะเรื่อง แจ้งผู้เขียน อนุญาต/จำกัดการเผยแพร่

### User Events (เหตุการณ์ผู้ใช้)
- **Event**: UserRegistered (ลงทะเบียนผู้ใช้)
  - **When**: สร้างบัญชีผู้ใช้ใหม่
  - **Payload**: userId, email, registrationDate, source
  - **Downstream**: สร้างกระเป๋าเงิน ส่งการตรวจสอบ เริ่มต้นโปรไฟล์

- **Event**: UserEmailVerified (ยืนยันอีเมลผู้ใช้)
  - **When**: เสร็จสิ้นการตรวจสอบอีเมล
  - **Payload**: userId, verificationDate
  - **Downstream**: เปิดใช้งานบัญชี ปลดล็อกฟีเจอร์ ส่งข้อความต้อนรับ

- **Event**: UserLoggedIn (เข้าสู่ระบบผู้ใช้)
  - **When**: ผู้ใช้ตรวจสอบสำเร็จ
  - **Payload**: userId, loginDate, deviceInfo, location
  - **Downstream**: อัปเดตเซสชัน ติดตามรูปแบบการเข้าสู่ระบบ การตรวจสอบความปลอดภัย