# Domain Model Specification (Stage 2) - Part 3: Value Objects

## 3. VALUE OBJECTS

## Value Object: CreditAmount (จำนวนเครดิต)
- **Description**: แสดงปริมาณเครดิตพร้อมกฎการตรวจสอบ
- **Attributes**:
  - amount (integer) - ปริมาณเครดิต (ต้อง >= 0)
  - currency (string, default: "CRED") - ตัวระบุสกุลเครดิต
- **Validation Rules**:
  - จำนวนต้องไม่เป็นลบ
  - จำนวนสูงสุดจำกัดโดยการกำหนดค่าระบบ
  - ต้องเป็นจำนวนเต็ม (ไม่มีเศษเครดิต)

## Value Object: RefillInterval (ช่วงเวลาเติมเต็ม)
- **Description**: การกำหนดค่าสำหรับการเติมเต็มเครดิตอัตโนมัติ
- **Attributes**:
  - intervalMinutes (integer) - นาทีระหว่างการเติมเต็ม (ต้อง > 0)
  - amount (CreditAmount) - เครดิตที่เพิ่มต่อการเติมเต็ม
  - activeHours (array) - ชั่วโมงที่เติมเต็ม (รูปแบบ 24 ชั่วโมง)
- **Validation Rules**:
  - ช่วงเวลาต้องอยู่ระหว่าง 1-1440 นาที
  - จำนวนเติมเต็มต้องเป็นบวก
  - ชั่วโมงที่ใช้งานต้องเป็นเวลา 24 ชั่วโมงที่ถูกต้อง

## Value Object: ChoiceOutcome (ผลลัพธ์ตัวเลือก)
- **Description**: จำแนกผลลัพธ์และผลที่ตามมาของตัวเลือก
- **Attributes**:
  - type (enum) - หมวดหมู่ผลลัพธ์ (positive, negative, neutral, mixed)
  - severity (integer, 1-10) - ขนาดผลกระทบ
  - description (string) - คำอธิบายผลลัพธ์
- **Validation Rules**:
  - ความรุนแรงต้องอยู่ระหว่าง 1-10
  - ประเภทต้องเป็นค่า enum ที่ถูกต้อง
  - คำอธิบายต้องไม่เกิน 200 ตัวอักษร

## Value Object: StoryGenre (ประเภทเรื่อง)
- **Description**: การจำแนกหมวดหมู่เนื้อหาเรื่อง
- **Attributes**:
  - genre (enum) - ประเภท (romance, horror, adventure, mystery, fantasy, scifi, drama, comedy)
  - subGenre (string, nullable) - การจำแนกที่เฉพาะเจาะจงยิ่งขึ้น
  - tags (array of strings) - แท็กเนื้อหา
- **Validation Rules**:
  - ประเภทต้องเป็น enum ที่ถูกต้อง
  - ประเภทย่อยต้องเกี่ยวข้องกับประเภทหลัก
  - แท็กจำกัด 50 ตัวอักษรต่อแท็ก

## Value Object: SceneCoordinates (พิกัดฉาก)
- **Description**: ข้อมูลตำแหน่งสำหรับการแสดงภาพเครื่องมือแก้ไขเรื่อง
- **Attributes**:
  - x (integer) - ตำแหน่งแนวนอน
  - y (integer) - ตำแหน่งแนวตั้ง
  - zoomLevel (decimal) - ระดับซูมเครื่องมือแก้ไข
- **Validation Rules**:
  - พิกัดต้องอยู่ภายในขอบเขตเครื่องมือแก้ไข
  - ระดับซูมระหว่าง 0.1-5.0

## Value Object: TextSegment (ส่วนข้อความ)
- **Description**: การกำหนดค่าการซ้อนข้อความตามเวลา
- **Attributes**:
  - text (string) - ข้อความที่แสดง
  - startTime (decimal) - เวลาเริ่มต้นในวินาที
  - duration (decimal) - ระยะเวลาแสดงในวินาที
  - animationType (enum) - แอนิเมชันข้อความ (fade, slide, typewriter)
  - position (json) - พิกัดตำแหน่งหน้าจอ
- **Validation Rules**:
  - ระยะเวลาต้องเป็นบวก
  - เวลาเริ่มต้นต้อง >= 0
  - ความยาวข้อความเหมาะสมกับระยะเวลา

## Value Object: UnlockCondition (เงื่อนไขการปลดล็อก)
- **Description**: เงื่อนไขที่ซับซ้อนสำหรับการปลดล็อกเนื้อหา
- **Attributes**:
  - type (enum) - ประเภทเงื่อนไข (achievement, story_completion, credit_threshold, date_based)
  - parameters (json) - พารามิเตอร์เฉพาะเงื่อนไข
  - operator (enum) - ตัวดำเนินการตรรกะ (AND, OR, NOT)
  - subConditions (array) - เงื่อนไขย่อยสำหรับตรรกะที่ซับซ้อน
- **Validation Rules**:
  - พารามิเตอร์ต้องตรงกับประเภทเงื่อนไข
  - ไม่มีการอ้างอิงแบบวงจรใน subConditions
  - ความลึกของการซ้อนสูงสุด 3 ระดับ

## Value Object: StoryState (สถานะเรื่อง)
- **Description**: สถานะการเผยแพร่และแก้ไขของเรื่อง
- **Attributes**:
  - status (enum) - สถานะปัจจุบัน (draft, ready, published, archived)
  - lastChanged (datetime) - การเปลี่ยนแปลงสถานะครั้งล่าสุด
  - changedBy (UUID) - ผู้ที่เปลี่ยนแปลง
  - reason (string) - เหตุผลการเปลี่ยนแปลง
- **Validation Rules**:
  - การเปลี่ยนสถานะต้องทำตามเส้นทางที่อนุญาต
  - ต้องมีเหตุผลสำหรับการเปลี่ยนสถานะ
  - เฉพาะผู้เขียน/ผู้ดูแลระบบที่สามารถเปลี่ยนสถานะ

## Value Object: RatingBreakdown (การแจกแจงการจัดอันดับ)
- **Description**: การกระจายของการจัดอันดับดาว
- **Attributes**:
  - oneStar (integer) - จำนวนการจัดอันดับ 1 ดาว
  - twoStar (integer) - จำนวนการจัดอันดับ 2 ดาว
  - threeStar (integer) - จำนวนการจัดอันดับ 3 ดาว
  - fourStar (integer) - จำนวนการจัดอันดับ 4 ดาว
  - fiveStar (integer) - จำนวนการจัดอันดับ 5 ดาว
  - totalRatings (integer) - จำนวนรวม
- **Validation Rules**:
  - จำนวนทั้งหมดต้อง >= 0
  - ผลรวมต้องเท่ากับผลรวมของจำนวนแต่ละรายการ
  - ไม่สามารถมีค่าลบได้

## Value Object: MediaMetadata (ข้อมูลเมตาสื่อ)
- **Description**: ข้อมูลทางเทคนิคเกี่ยวกับสื่อ
- **Attributes**:
  - width (integer, nullable) - ความกว้างพิกเซลสำหรับรูปภาพ/วิดีโอ
  - height (integer, nullable) - ความสูงพิกเซลสำหรับรูปภาพ/วิดีโอ
  - duration (decimal, nullable) - ระยะเวลาในวินาทีสำหรับวิดีโอ/เสียง
  - format (string) - รูปแบบไฟล์ (mp4, jpg, mp3, etc.)
  - quality (string) - ระดับคุณภาพ (720p, 1080p, etc.)
- **Validation Rules**:
  - มิติต้องเป็นจำนวนเต็มบวก
  - ระยะเวลาต้องเป็นบวกสำหรับวิดีโอ/เสียง
  - รูปแบบต้องได้รับการรองรับโดยแพลตฟอร์ม