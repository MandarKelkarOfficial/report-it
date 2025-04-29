// backend/server.js
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const multer = require("multer");
require("dotenv").config();

const {
  User,
  Report,
  ActivityLog,
  Session,
  TimeSpent,
  ReportImage,
  ReportActivity,
} = require("./models/models");

const app = express();

app.set("trust proxy", true);
app.use(express.json());
app.use(cors());

// Memory storage so files come in as Buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images allowed"), false);
    }
    cb(null, true);
  },
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

async function commitTimeForUser(userId) {
  // find all valid sessions
  const sessions = await Session.find({ user: userId, valid: true });
  for (let session of sessions) {
    const deltaMinutes = Math.floor(
      (Date.now() - session.createdAt.getTime()) / 60000
    );
    console.log(`⏱️  Recording ${deltaMinutes}min for session ${session._id}`);

    await TimeSpent.findOneAndUpdate(
      { user: userId },
      { $inc: { minutes: deltaMinutes } },
      { upsert: true, new: true }
    );

    session.valid = false;
    await session.save();
  }
}

async function logActivity(userId, action, req) {
  // Try X-Forwarded-For first, then fall back to req.ip, then socket
  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : typeof forwarded === "string"
    ? forwarded.split(",")[0].trim()
    : req.ip || req.socket.remoteAddress || "unknown";

  await ActivityLog.create({
    user: userId,
    action,
    ip, // now a guaranteed string
    userAgent: req.get("User-Agent"),
  });
}

// Middleware: Authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.sendStatus(401);
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.sendStatus(403);
    req.user = payload; // { id, role }
    next();
  });
}

// Middleware: Admin-only
function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") return res.sendStatus(403);
  next();
}
function requireAgent(req, res, next) {
  if (req.user.role !== "field-agent") return res.sendStatus(403);
  next();
}

function requireManager(req, res, next) {
  if (req.user.role !== "manager") return res.sendStatus(403);
  next();
}

// --- AUTH ROUTES ---

// Sign Up
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password, contact, role } = req.body;
  if (!name || !email || !password || !contact)
    return res.status(400).json({ msg: "Missing fields" });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ msg: "Email already in use" });

  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    password: hash,
    contact,
    role,
  });
  res.status(201).json({ msg: "Registered — awaiting admin approval" });
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ msg: "Invalid credentials" });
  if (!user.isApproved)
    return res.status(403).json({ msg: "Account not approved yet" });
  if (!(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ msg: "Invalid credentials" });

  // ✨ Flush any old sessions so timeSpent never resets if they closed browser instead of logging out
  try {
    await commitTimeForUser(user._id);
  } catch (e) {
    console.error("Error committing time on login:", e);
  }

  // Issue JWT
  const payload = { id: user._id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "8h" });

  // Create new session
  await Session.create({
    user: user._id,
    expiresAt: new Date(Date.now() + 8 * 3600000),
  });

  await logActivity(user._id, "login", req);

  res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
});

// Get profile
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  const user = await User.findById(
    req.user.id,
    "-password -resetPasswordToken -twoFactor.secret"
  );
  res.json({ user });
});

// Logout
// app.post("/api/auth/logout", authenticateToken, async (req, res) => {
//   // Invalidate all sessions for simplicity:
//   await Session.updateMany({ user: req.user.id }, { valid: false });
//   await logActivity(req.user.id, "logout", req);
//   res.json({ msg: "Logged out" });
// });

// Logout
// app.post("/api/auth/logout", authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // 1) Find all currently valid sessions for this user
//     const sessions = await Session.find({ user: userId, valid: true });

//     // 2) For each session, compute time delta and accumulate into TimeSpent
//     for (let session of sessions) {
//       const now = Date.now();
//       const createdAtMs = session.createdAt.getTime();
//       const deltaMinutes = Math.floor((now - createdAtMs) / 60000);

//       // Upsert into TimeSpent collection
//       await TimeSpent.findOneAndUpdate(
//         { user: userId },
//         { $inc: { minutes: deltaMinutes } },
//         { upsert: true, new: true }
//       );

//       // 3) Invalidate that session
//       session.valid = false;
//       await session.save();
//     }

//     // 4) Log the logout activity
//     await logActivity(userId, "logout", req);

//     return res.json({ msg: "Logged out and time recorded" });
//   } catch (err) {
//     console.error("Logout Error:", err);
//     return res.status(500).json({ msg: "Logout failed" });
//   }
// });

app.post("/api/auth/logout", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // ✨ Commit time for this session too
    await commitTimeForUser(userId);

    await logActivity(userId, "logout", req);
    return res.json({ msg: "Logged out and time recorded" });
  } catch (err) {
    console.error("Logout Error:", err);
    return res.status(500).json({ msg: "Logout failed" });
  }
});

// --- REPORT ROUTES ---
// Create a report
// backend/server.js (or wherever you define routes)

app.post("/api/reports", authenticateToken, async (req, res) => {
  try {
    // Pull everything off the body that your schema now needs
    const { projectName, projectNumber, customer, workDone, priority, status } =
      req.body;

    // 🔍 Fetch the full user to get their name
    const userDoc = await User.findById(req.user.id).select("name");
    if (!userDoc) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Create the report with ALL required fields
    const report = await Report.create({
      agent: req.user.id,
      createdBy: userDoc.name, // string name
      projectName, // required now
      projectNumber,
      customer,
      workDone,
      priority,
      status, // required now
      // optional
    });

    // Log the creation activity
    await logActivity(req.user.id, "create-report", req);

    // Return the new report
    return res.status(201).json({ report });
  } catch (err) {
    console.error("Error creating report:", err);

    // Duplicate key (unique index) error
    if (err.code === 11000 && err.keyPattern?.projectNumber) {
      return res
        .status(400)
        .json({ field: "projectNumber", msg: "Project number already exists" });
    }

    // Mongoose validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ msg: "Validation failed", errors: messages });
    }

    return res.status(500).json({ msg: "Server error" });
  }

  // If it's a Mongoose validation error, show the messages
  //   if (err.name === "ValidationError") {
  //     const messages = Object.values(err.errors).map((e) => e.message);
  //     return res
  //       .status(400)
  //       .json({ msg: "Validation failed", errors: messages });
  //   }
  //   // Otherwise, generic 500
  //   return res.status(500).json({ msg: "Server error" });
  // }
});

// Get reports (admin sees all; agents see their own)
app.get("/api/reports", authenticateToken, async (req, res) => {
  // Return absolutely all reports to the client
  const reports = await Report.find({}).populate("agent", "name email role");
  res.json({ reports });
});

// --- ADMIN ROUTES ---
// List pending user approvals
// app.get('/api/admin/pending-users', authenticateToken, requireAdmin, async (_req, res) => {
//   const users = await User.find({ isApproved: false }, 'name email');
//   res.json({ users });
// });

app.get(
  "/api/admin/pending-users",
  authenticateToken,
  requireAdmin,
  async (_req, res) => {
    console.log("Api working of pending users...");
    try {
      const users = await User.find(
        { role: { $ne: "admin" } }, // Exclude admin users
        "name email role createdAt" // Include necessary fields
      ).lean();
      res.json({ users });
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Approve or revoke a user

// ==================================================================================================
// backend/server.js (or routes/users.js)
app.get(
  "/api/admin/users",
  authenticateToken,
  requireAdmin,
  async (_req, res) => {
    try {
      // Fetch every non-admin user, include isApproved flag
      const users = await User.find(
        { role: { $ne: "admin" } },
        "name email role isApproved createdAt"
      ).lean();

      return res.json({ users });
    } catch (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// Get user details
app.get(
  "/api/admin/users/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get user-specific logs
app.get(
  "/api/admin/users/:id/logs",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const logs = await ActivityLog.find({ user: req.params.id })
        .sort("-createdAt")
        .lean();
      res.json({ logs });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);
// ==================================================================================================

app.post(
  "/api/admin/users/:id/:action",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const { id, action } = req.params;
    // Only allow "approve" or "revoke"
    if (!["approve", "revoke"].includes(action)) {
      return res.status(400).json({ msg: "Invalid action" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isApproved: action === "approve" },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    await logActivity(req.user.id, `${action}-user:${id}`, req);
    res.json({ user });
  }
);

// View activity logs
app.get(
  "/api/admin/logs",
  authenticateToken,
  requireAdmin,
  async (_req, res) => {
    const logs = await ActivityLog.find()
      .populate("user", "name")
      .sort("-createdAt");
    res.json({ logs });
  }
);

app.get(
  "/api/admin/online",
  authenticateToken,
  requireAdmin,
  async (_req, res) => {
    const now = new Date();
    const sessions = await Session.find({
      valid: true,
      expiresAt: { $gt: now },
    }).lean();
    const onlineUsers = [...new Set(sessions.map((s) => s.user.toString()))];
    res.json({ onlineUsers });
  }
);

//==========================DASHBOARD========================

// Example API endpoints
app.get(
  "/api/admin/dashboard-stats",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const stats = {
        totalUsers: await User.countDocuments(),
        pendingApprovals: await User.countDocuments({ isApproved: false }),
        activeReports: await Report.countDocuments({
          status: { $in: ["Open", "In-Progress"] },
        }),
      };
      res.json({ stats });
    } catch (err) {
      console.error("Dashboard Stats Error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Field‐agent stats (only agents)

app.get(
  "/api/agent/dashboard-stats",
  authenticateToken,
  requireAgent,
  async (req, res) => {
    try {
      const userId = req.user.id || req.user._id;

      const totalReports = await Report.countDocuments({ agent: userId });

      // get the cumulative minutes so far
      const ts = await TimeSpent.findOne({ user: userId }).lean();
      const totalMinutes = ts.minutes;
      console.log("Total minutes:", totalMinutes);

      return res.json({
        totalReports,
        minutes: totalMinutes,
      });
    } catch (err) {
      console.error("Dashboard Stats Error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// Manager stats (only managers)
app.get(
  "/api/manager/dashboard-stats",
  authenticateToken,
  requireManager,
  async (req, res) => {
    try {
      const stats = {
        teamReports: await Report.countDocuments(),
        completedProjects: await Report.countDocuments({
          status: "Done",
        }),
        ongoingProjects: await Report.countDocuments({
          status: "In-Progress",
        }),
      };
      res.json({ stats });
    } catch (err) {
      console.error("Dashboard Stats Error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// POST /api/reports/upload-img-blob
app.post(
  "/api/reports/upload-img-blob",
  authenticateToken,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { reportId } = req.body;
      if (!reportId) {
        return res.status(400).json({ msg: "reportId is required" });
      }

      // Build image docs from buffer + mimetype
      const images = req.files.map((f) => ({
        data: f.buffer,
        contentType: f.mimetype,
      }));

      // Create the document
      const doc = await ReportImage.create({
        report: reportId,
        user: req.user.id,
        images,
      });

      res.json({
        msg: "Images uploaded as blobs!",
        count: doc.images.length,
      });
    } catch (err) {
      console.error("Error uploading blobs:", err);
      res.status(500).json({ msg: "Server error during image upload" });
    }
  }
);

// routes/images.js
app.get("/api/reports/:id/images", async (req, res) => {
  try {
    const reportId = req.params.id;
    const images = await ReportImage.find({ report: reportId });
    if (!images.length) {
      return res.status(404).json({ msg: "No images found for this report" });
    }
    // Map each doc’s data to a base64 payload
    const payload = images.map((img) => ({
      contentType: img.contentType,
      data: img.data.toString("base64"),
    }));
    res.json({ images: payload });
  } catch (err) {
    console.error("Error fetching images:", err);
    res.status(500).json({ msg: "Server error during image fetch" });
  }
});

// Fetch activities
app.get(
  "/api/report-activity/:reportId",
  authenticateToken,
  async (req, res) => {
    try {
      const activity = await ReportActivity.findOne({
        report: req.params.reportId,
      }).populate("comments.user", "name role");
      res.json(activity || { comments: [] });
    } catch (err) {
      console.error("Fetch activity error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// Post a comment
app.post(
  "/api/report-activity/:reportId/comment",
  authenticateToken,
  async (req, res) => {
    try {
      const { message } = req.body;
      if (!message)
        return res.status(400).json({ msg: "Comment cannot be empty" });

      let activity = await ReportActivity.findOne({
        report: req.params.reportId,
      });

      if (!activity) {
        activity = new ReportActivity({
          report: req.params.reportId,
          comments: [],
        });
      }

      activity.comments.push({ user: req.user.id, message });
      await activity.save();

      res.status(201).json({ msg: "Comment added", activity });
    } catch (err) {
      console.error("Add comment error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// 404 handler
app.use((_, res) => res.status(404).json({ msg: "Not Found" }));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
