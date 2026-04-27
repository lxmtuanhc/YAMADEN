const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

app.use(cors({
  origin: "*"
}));

app.use(express.json({ limit: "100mb" }));

// Cho server hiển thị index.html, admin.html, icon, manifest
app.use(express.static(__dirname));

// ===== MongoDB Connect =====
mongoose.connect("mongodb+srv://lxmtuanhc_db_user:yamadenapp@cluster0.revraqf.mongodb.net/yamaden?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error:", err));

// ===== Schema =====
const RequestSchema = new mongoose.Schema({
  // ID mới là String: YD-1234
  // ID cũ trong DB có thể vẫn là Number
  id: mongoose.Schema.Types.Mixed,

  name: String,
  phone: String,
  contact: String,
  address: String,

  content: String,
  image: String,

  status: String,
  adminReply: String,
  createdAt: Date
});

const Request = mongoose.model("Request", RequestSchema);

// ===== Hỗ trợ cả ID mới String và ID cũ Number =====
function makeIdQuery(id) {
  const query = [{ id: id }];

  if (!isNaN(Number(id))) {
    query.push({ id: Number(id) });
  }

  return { $or: query };
}

// ===== Generate short ID =====
async function generateRequestId() {
  let id;
  let exists;

  do {
    id = "YD-" + Math.floor(1000 + Math.random() * 9000);
    exists = await Request.findOne({ id });
  } while (exists);

  return id;
}

// Trang chính
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Tạo yêu cầu mới
app.post("/request", async (req, res) => {
  try {
    const shortId = await generateRequestId();

    const newRequest = new Request({
      id: shortId,

      name: req.body.name || "",
      phone: req.body.phone || "",
      contact: req.body.contact || "",
      address: req.body.address || "",

      content: req.body.content || "",
      image: req.body.image || "",

      status: "pending",
      adminReply: "",
      createdAt: new Date()
    });

    await newRequest.save();

    res.json({
      message: "Saved to MongoDB",
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
app.get("/requests", async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Read failed",
      error: error.message
    });
  }
});

// Tra cứu 1 yêu cầu theo ID
app.get("/request/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const item = await Request.findOne(makeIdQuery(id));

    if (!item) {
      return res.status(404).json({
        message: "Not found"
      });
    }

    res.json(item);

  } catch (error) {
    res.status(500).json({
      message: "Read failed",
      error: error.message
    });
  }
});

// Cập nhật trạng thái / phản hồi admin
app.put("/request/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const item = await Request.findOne(makeIdQuery(id));

    if (!item) {
      return res.status(404).json({
        message: "Not found"
      });
    }

    if (req.body.status) {
      item.status = req.body.status;
    }

    if (req.body.adminReply !== undefined) {
      item.adminReply = req.body.adminReply;
    }

    await item.save();

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

// Xóa yêu cầu
app.delete("/request/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await Request.deleteOne(makeIdQuery(id));

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Not found"
      });
    }

    res.json({
      message: "Deleted"
    });

  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});