import { useEffect, useState } from "react";

function App() {
  const [clients, setClients] = useState([]);
  const [name, setName] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const [isRegister, setIsRegister] = useState(false); // перемикання між логіном і реєстрацією

  // ==========================
  // Логін
  // ==========================
  const login = async () => {
    if (!username || !password) return alert("Введіть логін та пароль");
    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        fetchClients();
        alert("Логін успішний!");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Помилка логіну");
    }
  };

  // ==========================
  // Реєстрація
  // ==========================
  const register = async () => {
    if (!username || !password) return alert("Введіть логін і пароль");
    try {
      const res = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Реєстрація успішна! Тепер можна увійти.");
        setIsRegister(false);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Помилка при реєстрації");
    }
  };

  // ==========================
  // Отримання клієнтів
  // ==========================
  const fetchClients = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:3000/api/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchClients();
  }, [token]);

  // ==========================
  // Додавання клієнта
  // ==========================
  const addClient = async () => {
    if (!name) return;
    try {
      await fetch("http://localhost:3000/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      setName("");
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================
  // Видалення клієнта
  // ==========================
  const deleteClient = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/clients/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================
  // Редагування клієнта
  // ==========================
  const editClient = async (id) => {
    const newName = prompt("Введіть нове ім'я клієнта:");
    if (!newName) return;
    try {
      await fetch(`http://localhost:3000/api/clients/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }),
      });
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================
  // Вихід
  // ==========================
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUsername("");
    setPassword("");
    setClients([]);
  };

  return (
    <div style={{ padding: "20px" }}>
      {!token ? (
        <div>
          {isRegister ? (
            <div>
              <h2>Реєстрація</h2>
              <input
                type="text"
                placeholder="Логін"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button onClick={register}>Зареєструватися</button>
              <p>
                Вже є акаунт?{" "}
                <button onClick={() => setIsRegister(false)}>Увійти</button>
              </p>
            </div>
          ) : (
            <div>
              <h2>Логін</h2>
              <input
                type="text"
                placeholder="Логін"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button onClick={login}>Увійти</button>
              <p>
                Нема акаунта?{" "}
                <button onClick={() => setIsRegister(true)}>Зареєструватися</button>
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h1>Клієнти</h1>
          <button onClick={logout}>Вийти</button>
          <br /><br />
          <input
            type="text"
            placeholder="Введіть ім'я"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={addClient}>Додати</button>

          <ul>
            {clients.map((client) => (
              <li key={client.id}>
                {client.name}{" "}
                <button onClick={() => deleteClient(client.id)}>Видалити</button>{" "}
                <button onClick={() => editClient(client.id)}>Редагувати</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;