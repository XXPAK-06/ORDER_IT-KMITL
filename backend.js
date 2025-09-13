const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const db = new sqlite3.Database('./food_ordering.db');

app.use(bodyParser.json());

// สร้างตารางฐานข้อมูล
db.serialize(() => {
  // ตารางผู้ใช้
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE,
    name TEXT,
    phone TEXT,
    email TEXT
  )`);

  // ตารางร้านอาหาร
  db.run(`CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    type TEXT
  )`);

  // ตารางเมนูอาหาร
  db.run(`CREATE TABLE IF NOT EXISTS menus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER,
    name TEXT,
    price REAL,
    FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
  )`);

  // ตารางออเดอร์
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    restaurant_id INTEGER,
    order_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending',
    note TEXT,
    queue_number INTEGER,
    total_price REAL,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
  )`);

  // ตารางรายการในออเดอร์
  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    menu_id INTEGER,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(menu_id) REFERENCES menus(id)
  )`);
});

// API endpoints สำหรับร้านอาหาร
app.get('/restaurants', (req, res) => {
  db.all(`SELECT * FROM restaurants`, [], (err, restaurants) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(restaurants);
  });
});

app.get('/restaurants/:id/menu', (req, res) => {
  const { id } = req.params;
  db.all(`SELECT * FROM menus WHERE restaurant_id = ?`, [id], (err, menu) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(menu);
  });
});

// API endpoints สำหรับออเดอร์
app.post('/orders', (req, res) => {
  const { user_id, restaurant_id, items, note } = req.body;
  const queue_number = Math.floor(Math.random() * 1000) + 1;
  
  db.run(
    `INSERT INTO orders (user_id, restaurant_id, note, queue_number) 
     VALUES (?, ?, ?, ?)`,
    [user_id, restaurant_id, note, queue_number],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      const order_id = this.lastID;
      let total_price = 0;
      
      // เพิ่มรายการอาหารในออเดอร์
      items.forEach(item => {
        db.run(
          `INSERT INTO order_items (order_id, menu_id, quantity, price) 
           VALUES (?, ?, ?, ?)`,
          [order_id, item.menu_id, item.quantity, item.price]
        );
        total_price += item.price * item.quantity;
      });
      
      // อัพเดทราคารวม
      db.run(
        `UPDATE orders SET total_price = ? WHERE id = ?`,
        [total_price, order_id]
      );
      
      res.json({ 
        order_id, 
        queue_number,
        total_price
      });
    }
  );
});

app.get('/orders/:user_id', (req, res) => {
  const { user_id } = req.params;
  db.all(
    `SELECT o.*, r.name as restaurant_name
     FROM orders o
     JOIN restaurants r ON o.restaurant_id = r.id
     WHERE o.user_id = ?
     ORDER BY o.order_time DESC`,
    [user_id],
    (err, orders) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(orders);
    }
  );
});

app.put('/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.run(
    `UPDATE orders SET status = ? WHERE id = ?`,
    [status, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
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
  console.log('Food Ordering Backend running on http://localhost:3000');
});
