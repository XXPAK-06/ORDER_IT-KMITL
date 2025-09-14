# ITKMITL Food Ordering System

ระบบสั่งอาหารออนไลน์สำหรับโรงอาหารคณะไอที สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง

## Features
- ระบบคิวแต่ละร้านค้า
- ระบบสั่งอาหารออนไลน์
- ระบบติดตามสถานะอาหาร
- ระบบจัดการข้อมูลผู้ใช้

## Installation
1. Clone repository:
```bash
git clone https://github.com/XXPAK-06/ORDER_IT-KMITL.git
```

2. ติดตั้ง dependencies:
```bash
npm install
```

3. รันระบบ:
```bash
npm start
```

## Usage
โปรดดูรายละเอียดการใช้งานได้ที่ usage_guide.txt

## เทคโนโลยีที่ใช้
- Node.js
- Express
- SQLite3
- HTML/CSS/JavaScript

## Deploy
ระบบถูก deploy ที่ Render.com: [order-it-kmitl.onrender.com](https://order-it-kmitl.onrender.com)

## ผู้พัฒนา
- คณะเทคโนโลยีสารสนเทศ
- สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง
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
