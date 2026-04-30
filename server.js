require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors({
  origin: "*"
}));

app.use(express.json({ limit: "10mb" }));

// Cho server hiển thị index.html, admin.html, login.html, icon, manifest
app.use(express.static(__dirname));

// ===== Upload media bằng multer =====
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/|^video\//.test(file.mimetype || "");
    cb(ok ? null : new Error("Only image or video files are allowed"), ok);
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
const USER_JWT_SECRET = process.env.USER_JWT_SECRET || JWT_SECRET;

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

function getUserFromRequest(req) {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "");

  if (!token || !USER_JWT_SECRET) return null;

  try {
    const decoded = jwt.verify(token, USER_JWT_SECRET);
    if (decoded && decoded.role === "user") return decoded;
  } catch (err) {}

  return null;
}

function requireUser(req, res, next) {
  const user = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ message: "User login required" });
  }

  req.user = user;
  next();
}

// ===== MongoDB Connect =====
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error:", err));

// ===== Schema =====
const RequestSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.Mixed,
  userId: String,

  name: String,
  phone: String,
  contact: String,
  address: String,

  content: String,
  image: String,
  mediaUrl: String,
  mediaType: String,
  mediaFiles: [
    {
      url: String,
      type: String
    }
  ],

  status: String,
  adminReply: String,
  createdAt: Date
});

const Request = mongoose.model("Request", RequestSchema);

const UserSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  contact: String,
  company: String,
  customerType: String,
  province: String,
  projectName: String,
  address: String,
  pinHash: String,
  profileCompleted: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: "pending"
  },
  createdAt: Date,
  lastLoginAt: Date
});

const User = mongoose.model("User", UserSchema);

function publicUser(user) {
  const item = user.toObject ? user.toObject() : { ...user };
  delete item.pinHash;
  return item;
}

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

// ===== Upload buffer media lên Cloudinary =====
function uploadMediaToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "yamaden_requests",
        resource_type: "auto"
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

app.post("/user/register", async (req, res) => {
  try {
    if (!USER_JWT_SECRET) {
      return res.status(500).json({ message: "User login is not configured" });
    }

    const phone = String(req.body.phone || "").trim();
    const pin = String(req.body.pin || "").trim();

    if (!phone || !/^\d{4,6}$/.test(pin)) {
      return res.status(400).json({ message: "Phone and 4-6 digit PIN are required" });
    }

    const exists = await User.findOne({ phone });
    if (exists && exists.pinHash) {
      return res.status(409).json({ message: "Phone is already registered" });
    }

    const user = exists || new User({ phone, createdAt: new Date() });
    user.pinHash = await bcrypt.hash(pin, 10);
    user.status = user.status || "pending";
    user.profileCompleted = Boolean(user.name && user.email && user.province && user.projectName);
    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { role: "user", userId: String(user._id), phone: user.phone },
      USER_JWT_SECRET,
      { expiresIn: "180d" }
    );

    res.json({ message: "Register success", token, user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Register failed", error: error.message });
  }
});

app.post("/user/login", async (req, res) => {
  try {
    if (!USER_JWT_SECRET) {
      return res.status(500).json({ message: "User login is not configured" });
    }

    const phone = String(req.body.phone || "").trim();
    const pin = String(req.body.pin || "").trim();

    if (!phone || !pin) {
      return res.status(400).json({ message: "Phone and PIN are required" });
    }

    const user = await User.findOne({ phone });
    if (!user || !user.pinHash) {
      return res.status(401).json({ message: "Invalid phone or PIN" });
    }

    const ok = await bcrypt.compare(pin, user.pinHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid phone or PIN" });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ message: "User is blocked" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { role: "user", userId: String(user._id), phone: user.phone },
      USER_JWT_SECRET,
      { expiresIn: "180d" }
    );

    res.json({ message: "Login success", token, user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

app.put("/user/profile", requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    ["name", "email", "company", "province", "projectName", "address", "contact"].forEach(field => {
      if (req.body[field] !== undefined) user[field] = String(req.body[field] || "").trim();
    });

    user.profileCompleted = Boolean(user.name && user.email && user.province && user.projectName);
    await user.save();
    res.json({ message: "Profile updated", user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
});

app.get("/user/me", requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(publicUser(user));
  } catch (error) {
    res.status(500).json({ message: "Read failed", error: error.message });
  }
});

app.get("/user/requests", requireUser, async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Read failed", error: error.message });
  }
});

app.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const counts = await Request.aggregate([
      { $match: { userId: { $ne: "" } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } }
    ]);
    const countMap = new Map(counts.map(item => [String(item._id), item.count]));

    res.json(users.map(user => {
      const item = publicUser(user);
      item.requestCount = countMap.get(String(user._id)) || 0;
      return item;
    }));
  } catch (error) {
    res.status(500).json({ message: "Read failed", error: error.message });
  }
});

app.get("/admin/users/:id/requests", requireAdmin, async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Read failed", error: error.message });
  }
});

app.put("/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    ["name", "phone", "email", "contact", "company", "customerType", "province", "projectName", "address", "status"].forEach(field => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    await user.save();
    res.json({ message: "Updated", data: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
});

app.delete("/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await Request.updateMany({ userId }, { $set: { userId: "" } });
    await User.deleteOne({ _id: userId });

    res.json({ message: "User deleted, requests kept" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
});

// Tạo yêu cầu mới - khách dùng, không cần login
app.post("/request", upload.array("image", 8), async (req, res) => {
  try {
    const shortId = await generateRequestId();
    const currentUser = getUserFromRequest(req);
    let requestUserId = "";

    if (currentUser) {
      const user = await User.findById(currentUser.userId);
      if (user && user.status === "active") {
        requestUserId = String(user._id);
      }
    }

    const mediaFiles = [];
    const files = Array.isArray(req.files) ? req.files : [];

    for (const file of files) {
      const uploadResult = await uploadMediaToCloudinary(file.buffer);
      const type = (uploadResult.resource_type === "video" || (file.mimetype || "").startsWith("video/")) ? "video" : "image";
      mediaFiles.push({
        url: uploadResult.secure_url,
        type
      });
    }

    const firstMedia = mediaFiles[0] || { url: "", type: "" };

    const newRequest = new Request({
      id: shortId,
      userId: requestUserId,

      name: req.body.name || "",
      phone: req.body.phone || "",
      contact: req.body.contact || "",
      address: req.body.address || "",

      content: req.body.content || "",
      image: firstMedia.type === "image" ? firstMedia.url : "",
      mediaUrl: firstMedia.url,
      mediaType: firstMedia.type,
      mediaFiles,

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
