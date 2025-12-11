# Domain Model Specification (Stage 2) - Part 4: Aggregates & Roots

## 4. AGGREGATES & ROOTS

## Aggregate: User Aggregate (แอกริเกตผู้ใช้)
- **Root Entity**: User
- **Entities Inside**: CreditWallet, UserAchievement, StoryProgress, Rating, Review
- **Consistency Boundaries** (ขอบเขตความสอดคล้อง):
  - ยอดเงินเครดิตของผู้ใช้ไม่สามารถเป็นลบได้
  - การปลดล็อกความสำเร็จต้องได้รับการตรวจสอบ
  - ความคืบหน้าเรื่องต้องรักษาเส้นทางที่ถูกต้อง
  - การจัดอันดับ/รีวิวต้องมีเรื่องที่จบแล้ว
- **Why This Aggregate Exists**: ทำให้มั่นใจในความสอดคล้องของข้อมูลผู้ใช้ในเอนทิตีที่เกี่ยวข้องทั้งหมด
- **Rules Enforced by Root** (กฎที่บังคับโดยรูท):
  - ธุรกรรมเครดิตต้องส่งผลให้ยอดเงินถูกต้องเสมอ
  - ความสำเร็จสามารถปลดล็อกได้เมื่อเงื่อนไขเป็นไปตามนั้นเท่านั้น
  - ความคืบหน้าเรื่องรักษาการเปลี่ยนสถานะที่ถูกต้อง
  - หนึ่งรีวิว/การจัดอันดับต่อเรื่องต่อผู้ใช้
- **Valid State Transitions** (การเปลี่ยนสถานะที่ถูกต้อง):
  - User: Pending → Active → Suspended → Deleted
  - CreditWallet: Active → Frozen (admin action)
  - StoryProgress: Started → InProgress → Completed

## Aggregate: Story Aggregate (แอกริเกตเรื่อง)
- **Root Entity**: Story
- **Entities Inside**: Scene, Choice (referenced), Asset (referenced)
- **Consistency Boundaries**:
  - โครงสร้างเรื่องต้องไม่เป็นวงจร (ไม่มีวงจรไม่สิ้นสุด)
  - ฉากทั้งหมดต้องเข้าถึงได้จากจุดเริ่มต้น
  - เรื่องที่เผยแพร่ต้องมีจุดสิ้นสุดที่ถูกต้อง
  - การจัดลำดับฉากต้องสอดคล้องกัน
- **Why This Aggregate Exists**: รักษาความสมบูรณ์ของโครงสร้างเรื่องเล่า
- **Rules Enforced by Root**:
  - ไม่มีฉากกำกวมโดยไม่มีการเชื่อมต่อ
  - ต้องมีฉากจบอย่างน้อยหนึ่งฉาก
  - การตรวจสอบกราฟฉากก่อนการเผยแพร่
  - ต้นทุนตัวเลือกต้องไม่เป็นลบ
- **Valid State Transitions**:
  - Story: Draft → Ready → Published → Archived
  - Scene: Created → Connected → Validated
  - ไม่สามารถลบฉากที่เป็นส่วนหนึ่งของเรื่องที่เผยแพร่

## Aggregate: Session Aggregate (แอกริเกตเซสชัน)
- **Root Entity**: StoryProgress
- **Entities Inside**: None (references to other aggregates)
- **Consistency Boundaries**:
  - การติดตามเส้นทางต้องคงที่ถูกต้อง
  - การใช้เครดิตภายในขีดจำกัดเซสชัน
  - สถานะความคืบหน้าต้องตรงกับโครงสร้างเรื่อง
- **Why This Aggregate Exists**: จัดการสถานะการเล่นชั่วคราว
- **Rules Enforced by Root**:
  - สามารถก้าวหน้าได้ตามเส้นทางเรื่องที่ถูกต้องเท่านั้น
  - ติดตามเครดิตที่ใช้อย่างแม่นยำ
  - การบังคับใช้หมดอายุเซสชัน
  - การแยกเซสชันผู้มาเยี่ยม
- **Valid State Transitions**:
  - StoryProgress: Started → InProgress → Completed → Archived
  - เซสชันผู้มาเยี่ยมหมดอายุหลัง 24 ชั่วโมง

## Aggregate: Achievement Aggregate (แอกริเกตความสำเร็จ)
- **Root Entity**: Achievement
- **Entities Inside**: UserAchievement
- **Consistency Boundaries**:
  - เงื่อนไขการปลดล็อกความสำเร็จต้องถูกต้อง
  - การติดตามความคืบหน้าต้องแม่นยำ
  - ไม่สามารถปลดล็อกความสำเร็จเดียวกันสองครั้ง
- **Why This Aggregate Exists**: จัดการความสมบูรณ์ของระบบเกมมิฟิเคชัน
- **Rules Enforced by Root**:
  - เงื่อนไขการปลดล็อกต้องทดสอบได้
  - การอัปเดตความคืบหน้าต้องเป็นแบบโมโนโทนิก
  - ห่วงโซ่ข้อกำหนดต้องไม่เป็นวงจร
- **Valid State Transitions**:
  - Achievement: Draft → Active → Retired
  - UserAchievement: Progress → Unlocked