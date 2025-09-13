# Simple Slot Backend

## วิธีใช้งาน

1. ติดตั้ง dependencies:
   ```
   npm install express sqlite3 body-parser
   ```
2. รัน backend:
   ```
   node backend.js
   ```
3. API ที่มี:
   - POST `/register` : ลงทะเบียนผู้ใช้
   - POST `/book` : จอง slot
   - GET `/history/:student_id` : ดูประวัติการจอง
   - POST `/checkin` : check-in
   - POST `/checkout` : check-out

# วิธีการเปิดใช้งานเว็บไซต์จองโต๊ะ

1. ดาวน์โหลดหรือคัดลอกไฟล์ทั้งหมดไปไว้ในโฟลเดอร์ `QUEUE`

2. เปิดไฟล์ `index.html` ด้วยวิธีใดวิธีหนึ่งต่อไปนี้:
   - ดับเบิลคลิกที่ไฟล์ `index.html` เพื่อเปิดในเว็บเบราว์เซอร์
   - คลิกขวาที่ไฟล์ `index.html` แล้วเลือก "Open with" > เลือกเว็บเบราว์เซอร์ที่ต้องการ
   - ลากไฟล์ `index.html` ไปวางในหน้าต่างเว็บเบราว์เซอร์

3. เว็บไซต์จะเปิดขึ้นมาในเบราว์เซอร์และพร้อมใช้งาน
