const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

const DB_FILE = "requests.json";

function readData() {
  if (!fs.existsSync(DB_FILE)) return [];

  const content = fs.readFileSync(DB_FILE, "utf8");
  if (!content) return [];

  return JSON.parse(content);
}

function writeData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Test server
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// Tạo yêu cầu mới
app.post("/request", (req, res) => {
  const requests = readData();

  const newRequest = {
    id: Date.now(),
    name: req.body.name || "",
    content: req.body.content || "",
    image: req.body.image || "",
    status: "pending",
    createdAt: new Date()
  };

  requests.unshift(newRequest);
  writeData(requests);

  console.log("Saved:", newRequest);

  res.json({
    message: "Saved to local file",
    data: newRequest
  });
});

// Lấy danh sách yêu cầu
app.get("/requests", (req, res) => {
  res.json(readData());
});

// Cập nhật trạng thái
app.put("/request/:id", (req, res) => {
  const requests = readData();
  const id = Number(req.params.id);

  const item = requests.find(r => r.id === id);

  if (!item) {
    return res.status(404).json({
      message: "Not found"
    });
  }

  item.status = req.body.status || item.status;
  writeData(requests);

  console.log("Updated:", item);

  res.json({
    message: "Updated",
    data: item
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});