const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors({
  origin: "*"
}));

app.use(express.json({ limit: "100mb" }));

// Cho server hiển thị index.html, admin.html, icon, manifest
app.use(express.static(__dirname));

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

// Trang chính
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Tạo yêu cầu mới
app.post("/request", (req, res) => {
  try {
    const requests = readData();

    const newRequest = {
      id: Date.now(),

      // Thông tin khách hàng
      name: req.body.name || "",
      phone: req.body.phone || "",
      contact: req.body.contact || "",
      address: req.body.address || "",

      // Nội dung yêu cầu
      content: req.body.content || "",
      image: req.body.image || "",

      // Trạng thái
      status: "pending",
      createdAt: new Date()
    };

    requests.unshift(newRequest);
    writeData(requests);

    res.json({
      message: "Saved to local file",
      data: newRequest
    });
  } catch (error) {
    res.status(500).json({
      message: "Save failed",
      error: error.message
    });
  }
});

// Lấy danh sách yêu cầu
app.get("/requests", (req, res) => {
  try {
    res.json(readData());
  } catch (error) {
    res.status(500).json({
      message: "Read failed",
      error: error.message
    });
  }
});

// Cập nhật trạng thái
app.put("/request/:id", (req, res) => {
  try {
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

    res.json({
      message: "Updated",
      data: item
    });
  } catch (error) {
    res.status(500).json({
      message: "Update failed",
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});