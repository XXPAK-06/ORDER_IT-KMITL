const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const db = new sqlite3.Database('./slot.db');

app.use(bodyParser.json());

// สร้างตารางฐานข้อมูล
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE,
    name TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    slot_time TEXT,
    checkin_time TEXT,
    checkout_time TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

// ลงทะเบียนผู้ใช้
app.post('/register', (req, res) => {
  const { student_id, name } = req.body;
  db.run(
    `INSERT OR IGNORE INTO users (student_id, name) VALUES (?, ?)`,
    [student_id, name],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ user_id: this.lastID });
    }
  );
});

// จอง slot
app.post('/book', (req, res) => {
  const { student_id, slot_time } = req.body;
  db.get(`SELECT id FROM users WHERE student_id = ?`, [student_id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });
    db.run(
      `INSERT INTO bookings (user_id, slot_time) VALUES (?, ?)`,
      [user.id, slot_time],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ booking_id: this.lastID });
      }
    );
  });
});

// ดูประวัติการจอง
app.get('/history/:student_id', (req, res) => {
  const { student_id } = req.params;
  db.get(`SELECT id FROM users WHERE student_id = ?`, [student_id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });
    db.all(
      `SELECT * FROM bookings WHERE user_id = ? ORDER BY slot_time DESC`,
      [user.id],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  });
});

// check-in
app.post('/checkin', (req, res) => {
  const { booking_id } = req.body;
  const now = new Date().toISOString();
  db.run(
    `UPDATE bookings SET checkin_time = ? WHERE id = ?`,
    [now, booking_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, checkin_time: now });
    }
  );
});

// check-out
app.post('/checkout', (req, res) => {
  const { booking_id } = req.body;
  const now = new Date().toISOString();
  db.run(
    `UPDATE bookings SET checkout_time = ? WHERE id = ?`,
    [now, booking_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, checkout_time: now });
    }
  );
});

// ดึงข้อมูลผู้ใช้
app.get('/user/:student_id', (req, res) => {
  const { student_id } = req.params;
  db.get(
    `SELECT * FROM users WHERE student_id = ?`,
    [student_id],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    }
  );
});

// ดึงการจองที่กำลังใช้งานอยู่
app.get('/active-bookings/:student_id', (req, res) => {
  const { student_id } = req.params;
  db.get(`SELECT id FROM users WHERE student_id = ?`, [student_id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });
    db.all(
      `SELECT * FROM bookings 
       WHERE user_id = ? 
       AND checkin_time IS NOT NULL 
       AND checkout_time IS NULL`,
      [user.id],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  });
});

// อัพเดทข้อมูลผู้ใช้
app.put('/user/:student_id', (req, res) => {
  const { student_id } = req.params;
  const { name, email, phone } = req.body;
  db.run(
    `UPDATE users SET name = ?, email = ?, phone = ? WHERE student_id = ?`,
    [name, email, phone, student_id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});
