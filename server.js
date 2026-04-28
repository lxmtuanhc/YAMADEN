require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors({
  origin: "*"
}));

app.use(express.json({ limit: "10mb" }));

// Cho server hiển thị index.html, admin.html, login.html, icon, manifest
app.use(express.static(__dirname));

// ===== Upload ảnh bằng multer =====
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// ===== Cloudinary Config =====
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ===== Admin Login Config =====
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// ===== MongoDB Connect =====
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error:", err));

// ===== Schema =====
const RequestSchema = new mongoose.Schema({
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

// ===== Upload buffer ảnh lên Cloudinary =====
function uploadImageToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "yamaden_requests",
        resource_type: "image"
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
}

// Trang chính
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ===== Admin Login API =====
app.post("/admin/login", (req, res) => {
  const password = req.body.password || "";

  if (!ADMIN_PASSWORD || !JWT_SECRET) {
    return res.status(500).json({
      message: "Admin login is not configured"
    });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      message: "Wrong password"
    });
  }

  const token = jwt.sign(
    { role: "admin" },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    message: "Login success",
    token
  });
});

// Tạo yêu cầu mới - khách dùng, không cần login
app.post("/request", upload.single("image"), async (req, res) => {
  try {
    const shortId = await generateRequestId();

    let imageUrl = "";

    if (req.file) {
      const uploadResult = await uploadImageToCloudinary(req.file.buffer);
      imageUrl = uploadResult.secure_url;
    }

    const newRequest = new Request({
      id: shortId,

      name: req.body.name || "",
      phone: req.body.phone || "",
      contact: req.body.contact || "",
      address: req.body.address || "",

      content: req.body.content || "",
      image: imageUrl,

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

// Lấy danh sách yêu cầu - admin cần login
app.get("/requests", requireAdmin, async (req, res) => {
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

// Tra cứu 1 yêu cầu theo ID - khách dùng, không cần login
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

// Cập nhật trạng thái / phản hồi admin - admin cần login
app.put("/request/:id", requireAdmin, async (req, res) => {
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

// Xóa yêu cầu - admin cần login
app.delete("/request/:id", requireAdmin, async (req, res) => {
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