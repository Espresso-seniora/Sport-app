const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Сервер працює");
});

app.get("/test", (req, res) => {
    res.send("Тест працює");
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});