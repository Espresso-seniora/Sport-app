// server.js
const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "supersecretkey"; // краще зберігати у .env

app.use(cors());
app.use(express.json());

// ==================== Підключення до MySQL ====================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "sport_app",
});

db.connect((err) => {
  if (err) {
    console.log("Помилка підключення:", err);
  } else {
    console.log("Підключено до MySQL");
  }
});

// ==================== Middleware JWT ====================
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Треба токен" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Невірний токен" });
    req.user = decoded;
    next();
  });
};

// ==================== Тестові маршрути ====================
app.get("/", (req, res) => {
  res.send("Сервер працює");
});

app.get("/test", (req, res) => {
  res.send("Тест працює");
});

// ==================== Реєстрація ====================
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Логін і пароль обов'язкові" });

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res.status(400).json({ message: "Користувач вже існує" });
        return res.status(500).json({ message: "Помилка сервера", err });
      }
      res.json({ message: "Реєстрація успішна!" });
    }
  );
});

// ==================== Логін ====================
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Логін і пароль обов'язкові" });

  db.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
    if (err) return res.status(500).json({ message: "Помилка сервера" });
    if (results.length === 0)
      return res.status(400).json({ message: "Користувач не знайдений" });

    const user = results[0];
    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) return res.status(400).json({ message: "Невірний пароль" });

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token });
  });
});

// ==================== CRUD для Clients ====================
app.get("/api/clients", authenticate, (req, res) => {
  db.query("SELECT * FROM clients", (err, results) => {
    if (err) res.status(500).send(err);
    else res.json(results);
  });
});

app.post("/api/clients", authenticate, (req, res) => {
  const { name } = req.body;
  db.query("INSERT INTO clients (name) VALUES (?)", [name], (err, result) => {
    if (err) res.status(500).send(err);
    else res.json({ message: "Клієнт доданий" });
  });
});

app.delete("/api/clients/:id", authenticate, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM clients WHERE id = ?", [id], (err, result) => {
    if (err) res.status(500).send(err);
    else res.json({ message: "Клієнт видалений" });
  });
});

app.put("/api/clients/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  db.query("UPDATE clients SET name = ? WHERE id = ?", [name, id], (err, result) => {
    if (err) res.status(500).send(err);
    else res.json({ message: "Клієнт оновлений" });
  });
});

// ==================== Псевдокод запису на заняття ====================
app.post("/api/lessons/register", authenticate, (req, res) => {
  const { lessonId } = req.body;
  const userId = req.user.id;

  // тут можна додати перевірку існування користувача, заняття, місць
  // і запис у таблицю registrations
  // поки що просто відповідаємо тестово:
  res.json({ message: `Користувач ${userId} записаний на заняття ${lessonId}` });
});

// ==================== Старт серверу ====================
app.listen(3000, () => {
  console.log("Server started on port 3000");
});