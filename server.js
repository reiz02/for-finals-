const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const cron = require("node-cron");
const fs = require('fs');
const nodemailer = require("nodemailer");

const app = express();

// ===========================
// CORS & MIDDLEWARE
// ===========================
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
// ===========================
// IMAGE STORAGE
// ===========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
app.use("/uploads", express.static("uploads"));

// ===========================
// MONGODB CONNECTION
// ===========================
mongoose
.connect(
"mongodb://reicha:charm123@ac-rrphu9p-shard-00-00.vnlcxrd.mongodb.net:27017,ac-rrphu9p-shard-00-01.vnlcxrd.mongodb.net:27017,ac-rrphu9p-shard-00-02.vnlcxrd.mongodb.net:27017/FarmOpsDB?ssl=true&replicaSet=atlas-sajxzk-shard-0&authSource=admin&appName=Cluster0",
{
serverSelectionTimeoutMS: 5000,
bufferCommands: false,
}
)
.then(() => console.log("Successfully connected to FarmOpsDB"))
.catch((err) => console.error("MongoDB Connection Error:", err));
// ===========================
// SCHEMAS
// ===========================
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["employee", "admin"], default: "employee" },
    section: { type: String, default: "Inventory" },
    status: { type: String, enum: ["pending", "approved", "deactivated"], default: "pending" },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);

const productSchema = new mongoose.Schema(
  {
    name: String,
    // Category helps match earnings to inventory items (e.g., tomato, lettuce)
    category: { type: String, default: "" },
    price: Number,
    stock: Number,
    section: { type: String, default: "Inventory" },
    image: String,
    // Flag to mark a product as a Best Seller (set by admin)
    bestSeller: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Product = mongoose.model("Product", productSchema);

const earningsSchema = new mongoose.Schema(
  { 
    employeeEmail: String, 
    amount: Number, 
    month: Number, 
    year: Number,

    // ✅ ADD THIS
    quantity: { type: Number, default: 0 },
    // category and unit for Income entries (category maps to inventory)
    category: { type: String, default: "" },
    unit: { type: String, enum: ["cup", "kilo", "unit"], default: "unit" },

    date: String,
    description: String,
    type: String,
    encodedBy: String,
    role: String
  },
  { timestamps: true }
);
const Earnings = mongoose.model("Earnings", earningsSchema);

const reportSchema = new mongoose.Schema({
  dailyEarnings: { type: Number, default: 0 },
  dailyHistory: [{ date: String, total: Number }],
  monthlyEarnings: { type: Number, default: 0 },
  monthlyHistory: [{ month: Number, year: Number, total: Number }],
});
const Report = mongoose.model("Report", reportSchema);

// ===========================
// MIDDLEWARE
// ===========================
const inventoryAccess = async (req, res, next) => {
  try {
    const userId = req.headers.userid;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role === "admin" || user.section === "Inventory") return next();
    return res.status(403).json({ error: "Inventory access only" });
  } catch (err) {
    res.status(500).json({ error: "Access validation failed" });
  }
};

const normalizeType = (t) => (t || "Income").toString().trim();

// ===========================
// EMAIL / NODEMAILER SETUP
// ===========================
const verificationCodes = {}; // temporary store for codes
 

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "andresvivi143@gmail.com",
    pass: "bkvqqditbtcoqfad"
  }
});

// ===========================
// AUTH ROUTES
// ===========================

// CHECK IF ADMIN EXISTS (Updated for Debugging & Cache-Control)
app.get("/api/check-admin", async (req, res) => {
  try {
    const admin = await User.findOne({ role: "admin" });
    
    // Debug log para sa terminal
    console.log("--- Admin Security Check ---");
    console.log("Checking database for Admin role...");
    console.log("Result:", admin ? `Found: ${admin.email}` : "No Admin Found");

    // Force no-cache para sa browser
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json({ exists: !!admin });
  } catch (err) {
    console.error("❌ Admin check error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/send-code", async (req, res) => {
  try {
    const { email } = req.body;

    // ✅ ADD THIS
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const code = Math.floor(100000 + Math.random() * 900000);
    verificationCodes[email] = code;

    await transporter.sendMail({
      from: '"FarmOps System" <jazleemacalino03@gmail.com>',
      to: email,
      subject: "FarmOps Email Verification",
      text: `Your verification code is: ${code}`
    });

    res.json({ message: "Verification code sent" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, password, section, code } = req.body;
    if (verificationCodes[email] != code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }
    delete verificationCodes[email];

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      firstName, middleName, lastName, email,
      password: hashed, section, role: "employee", status: "pending"
    });
    await user.save();
    res.json({ message: "Account created. Waiting for admin approval." });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/register-admin", async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, password, code } = req.body;

    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      return res.status(403).json({ error: "Administrator already exists in the system." });
    }

    if (verificationCodes[email] != code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }
    delete verificationCodes[email];

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const admin = new User({
      firstName, middleName, lastName, email: email.trim().toLowerCase(),
      password: hashed, role: "admin", section: "Admin", status: "approved",
    });
    await admin.save();
    res.status(201).json({ message: "Admin verified and created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    if (user.status === "deactivated") {
      return res.status(403).json({ error: "Account deactivated. Contact admin." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });
    if (user.status !== "approved") return res.status(403).json({ error: "Waiting for admin approval" });

    res.json({
      message: "Login success",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        section: user.section,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



// ===========================
// NEW: FORGOT PASSWORD ROUTES
// FORGOT PASSWORD
// ===========================

// RESET PASSWORD ROUTES
// Forgot Password - Send Verification Code to Email
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ error: "Email not found" });

    const code = Math.floor(100000 + Math.random() * 900000);
    verificationCodes[email] = code;

    await transporter.sendMail({
      from: '"FarmOps System" <jazleemacalino03@gmail.com>',
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${code}`
    });
    res.json({ message: "Reset code sent to email" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send reset email" });
  }
});

// Reset Password
app.post("/api/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Validate password fields
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ error: "Missing password fields" });
    }

    // Check if passwords match
    if (newPassword.trim() !== confirmPassword.trim()) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Validate reset code
    if (verificationCodes[normalizedEmail] != code) {
      return res.status(400).json({ error: "Invalid reset code" });
    }

    // Hash the new password
    const hashed = await bcrypt.hash(newPassword.trim(), 10);

    // Update password in DB
    await User.findOneAndUpdate(
      { email: normalizedEmail },
      { password: hashed }
    );

    // Remove the code after use
    delete verificationCodes[normalizedEmail];

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ error: "Failed to update password" });
  }
});

// ===========================
// EMPLOYEE MANAGEMENT
// ===========================
// ===========================
// EMPLOYEE MANAGEMENT
// ===========================

// GET ALL EMPLOYEES
app.get("/api/employees", async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" }).sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});


// APPROVE EMPLOYEE
app.put("/api/employees/approve/:id", async (req, res) => {
  try {
    const emp = await User.findById(req.params.id);

    if (!emp) return res.status(404).json({ error: "Employee not found" });

    emp.status = "approved";
    await emp.save();

    res.json({ message: "Employee approved", employee: emp });
  } catch (err) {
    res.status(500).json({ error: "Approval failed" });
  }
});


// ✅ TOGGLE DEACTIVATE / REACTIVATE (FIXED)
app.put("/api/employees/deactivate/:id", async (req, res) => {
  try {
    const emp = await User.findById(req.params.id);

    if (!emp) return res.status(404).json({ error: "Employee not found" });

    if (emp.status === "deactivated") {
      emp.status = "approved"; // reactivate
    } else if (emp.status === "approved") {
      emp.status = "deactivated"; // deactivate
    } else if (emp.status === "pending") {
      return res.status(400).json({ error: "Cannot deactivate pending user" });
    }

    await emp.save();

    res.json({
      message: "Employee status updated",
      employee: emp,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});


// DELETE EMPLOYEE
app.delete("/api/employees/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// ===========================
// PRODUCTS
// ===========================
app.post("/api/products", inventoryAccess, upload.single("image"), async (req, res) => {
  try {
    const { name, price, stock, section, category } = req.body;
    // require at least a category/name, price and stock
    if ((!name && !category) || !price || !stock) return res.status(400).json({ error: "Missing product fields" });
    const product = new Product({
      name: name || category,
      category: category || name || "",
      price, stock, section,
      image: req.file ? `/uploads/${req.file.filename}` : ""
    });
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Product creation failed" });
  }
});

app.get("/api/products", inventoryAccess, async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.put("/api/products/:id", inventoryAccess, upload.single("image"), async (req, res) => {
  try {
    console.log("Received PUT request:");
    console.log("Product Data:", req.body); // Log request body
    console.log("File:", req.file); // Log the uploaded file

  const { name, price, stock, section, category } = req.body;
    const productId = req.params.id;
    
    // Find the product by ID
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Update product fields, only updating if data is provided
  product.name = name || category || product.name;
  product.category = category || product.category || product.name;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.section = section || product.section;

    // Check if a new image was uploaded, and update it
    if (req.file) {
      // Delete old image if it's there
      if (product.image) {
        const oldImagePath = path.join(__dirname, 'uploads', path.basename(product.image));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Delete the old image
        }
      }
      // Set the new image
      product.image = `/uploads/${req.file.filename}`;
    }

    // Save the updated product
    await product.save();
    res.json(product); // Send back the updated product
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Toggle or set Best Seller flag for a product (admin only)
app.put("/api/products/:id/bestseller", inventoryAccess, async (req, res) => {
  try {
    const { bestSeller } = req.body; // optional boolean
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // If caller didn't specify a value, toggle. Otherwise set explicitly.
    const newValue = bestSeller === undefined ? !product.bestSeller : !!bestSeller;

    // NOTE: allow multiple products to be marked as bestSeller simultaneously.
    // Previously we cleared other products when setting one as bestSeller; the
    // new behavior leaves other products unchanged so admins can mark multiple items.
    product.bestSeller = newValue;
    await product.save();
    res.json({ message: "Best seller updated", product });
  } catch (err) {
    console.error("Error toggling best seller:", err);
    res.status(500).json({ error: "Failed to update best seller" });
  }
});

// Get the currently marked best-seller product (single)
app.get('/api/best-seller', async (req, res) => {
  try {
    const product = await Product.findOne({ bestSeller: true });
    res.json(product || null);
  } catch (err) {
    console.error('Failed to fetch best seller:', err);
    res.status(500).json({ error: 'Failed to fetch best seller' });
  }
});

// Get all products currently marked as best-seller (may return multiple if data is inconsistent)
app.get('/api/best-sellers', async (req, res) => {
  try {
    const products = await Product.find({ bestSeller: true }).sort({ updatedAt: -1 });
    res.json(Array.isArray(products) ? products : []);
  } catch (err) {
    console.error('Failed to fetch best sellers:', err);
    res.status(500).json({ error: 'Failed to fetch best sellers' });
  }
});

app.delete("/api/products/:id", inventoryAccess, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
});

// ===========================
// EARNINGS
// ===========================
app.get("/api/earnings", async (req, res) => {
  // All amounts returned are in PHP (₱)
  const history = await Earnings.find().sort({ createdAt: -1 });
  res.json(history);
});

app.post("/api/earnings", async (req, res) => {
  try {
    const { employeeEmail, amount, date, description, type, quantity, encodedBy, role } = req.body;

    // New fields that the Reports page may send
    const category = req.body.category || (description || "");
    const unit = req.body.unit || "unit";

    const now = date ? new Date(date) : new Date();
    const today = now.toISOString().split("T")[0];

    if (isNaN(Number(amount))) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const entryType = normalizeType(type);

    const signedAmount = (entryType === "Expense" ? -1 : 1) * Number(amount);

    const saved = await new Earnings({
      employeeEmail,
      amount: Number(amount),
      quantity: entryType === "Income" ? (Number(quantity) || 0) : 0,
      category: entryType === "Income" ? (category || "") : "",
      unit: entryType === "Income" ? unit : "unit",
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      date: today,
      description: description || "",
      type: entryType,
      encodedBy: encodedBy || employeeEmail,
      role: role || "employee",
      createdAt: now,
      updatedAt: now
    }).save();

    const report = await Report.findOneAndUpdate(
      {},
      { $inc: { dailyEarnings: signedAmount, monthlyEarnings: signedAmount } },
      { upsert: true, new: true }
    );

    if (!report.dailyHistory) report.dailyHistory = [];
    if (!report.monthlyHistory) report.monthlyHistory = [];

    const dailyIndex = report.dailyHistory.findIndex(d => d.date === today);
    if (dailyIndex >= 0) {
      report.dailyHistory[dailyIndex].total += signedAmount;
    } else {
      report.dailyHistory.push({ date: today, total: signedAmount });
    }

    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const monthlyIndex = report.monthlyHistory.findIndex(
      m => m.month === month && m.year === year
    );

    if (monthlyIndex >= 0) {
      report.monthlyHistory[monthlyIndex].total = report.monthlyEarnings;
    } else {
      report.monthlyHistory.push({ month, year, total: report.monthlyEarnings });
    }

    await report.save();

    // If this was an Income entry with a category, decrement stock for matching product
    try {
      if (entryType === "Income" && category && Number(quantity) > 0) {
        // Try to find a product by category, fallback to name match
        let prod = await Product.findOne({ category: category });
        if (!prod) prod = await Product.findOne({ name: category });
        if (prod) {
          // If unit is 'kilo' or 'cup' or 'unit', we assume quantity uses same units as stock
          // For now, decrement by quantity (rounded). Avoid negative stock.
          prod.stock = Math.max(0, (Number(prod.stock) || 0) - Math.round(Number(quantity)));
          await prod.save();
        }

        // Recompute top-selling category across all Income earnings and mark best-seller
        const agg = await Earnings.aggregate([
          { $match: { type: "Income", category: { $ne: "" } } },
          { $group: { _id: "$category", totalQty: { $sum: "$quantity" } } },
          { $sort: { totalQty: -1 } },
          { $limit: 1 }
        ]);

        if (agg && agg.length > 0) {
          const topCategory = agg[0]._id;
          // Clear previous bestSeller flags and set for products matching topCategory
          await Product.updateMany({}, { $set: { bestSeller: false } });
          await Product.updateMany({ $or: [{ category: topCategory }, { name: topCategory }] }, { $set: { bestSeller: true } });
        }
      }
    } catch (e) {
      console.error('Error applying stock/best-seller update:', e);
    }

    res.json({ message: "Earning recorded", earning: saved, report });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Submit failed" });
  }
});

app.delete("/api/earnings/:id", async (req, res) => {
  try {
    const earning = await Earnings.findByIdAndDelete(req.params.id);
    if (!earning) return res.status(404).json({ error: 'Earning not found' });

    const todayIso = new Date().toISOString().split('T')[0];
    const all = await Earnings.find();

    const newDaily = all
      .filter(e => {
        const d = (e.date || (e.createdAt ? new Date(e.createdAt).toISOString().split('T')[0] : ''));
        return d === todayIso;
      })
      .reduce((sum, e) => {
        const type = (e.type || "").toString().trim();
        return sum + (type === "Expense" ? -1 : 1) * Number(e.amount || 0);
      }, 0);

    const report = await Report.findOne();
    if (report) {
      report.dailyEarnings = newDaily;

      if (!report.dailyHistory) report.dailyHistory = [];

      const idx = report.dailyHistory.findIndex(d => d.date === todayIso);
      if (idx >= 0) report.dailyHistory[idx].total = newDaily;
      else report.dailyHistory.push({ date: todayIso, total: newDaily });

      await report.save();
    }

    res.json({ message: "Deleted and recalculated", dailyEarnings: newDaily });

  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// ===========================
// UPDATE EARNINGS (NEW)
// ===========================
app.put("/api/earnings/:id", async (req, res) => {
  try {

    const {
      amount,
      date,
      description,
      type,
      quantity,
      encodedBy,
      role,
      category,
      unit
    } = req.body;

    const earning = await Earnings.findById(req.params.id);
    if (!earning) return res.status(404).json({ error: "Earning not found" });

    // Capture previous values so we can reconcile stock changes
    const prevType = earning.type;
    const prevQty = Number(earning.quantity || 0);
    const prevCategory = earning.category || earning.description || "";

    // Apply updates
    if (amount !== undefined) earning.amount = Number(amount);
    if (date) earning.date = date;
    if (description !== undefined) earning.description = description;
    if (type !== undefined) earning.type = normalizeType(type);
    // Allow explicit category/unit updates if provided
    if (category !== undefined) earning.category = category;
    if (unit !== undefined) earning.unit = unit;

    // Recompute quantity based on resulting type
    earning.quantity = earning.type === "Income" ? Number(quantity || 0) : 0;

    if (encodedBy !== undefined) earning.encodedBy = encodedBy;
    if (role !== undefined) earning.role = role;

    const parsedDate = earning.date ? new Date(earning.date) : new Date();
    earning.month = parsedDate.getMonth() + 1;
    earning.year = parsedDate.getFullYear();

    await earning.save();

    // After saving, reconcile inventory stock based on change in quantity/category/type
    try {
      const newType = earning.type;
      const newQty = Number(earning.quantity || 0);
      const newCategory = earning.category || earning.description || "";

      // Helper to find product by category or name
      const findProductFor = async (cat) => {
        if (!cat) return null;
        let p = await Product.findOne({ category: cat });
        if (!p) p = await Product.findOne({ name: cat });
        return p || null;
      };

      if (prevType === "Income" && newType === "Income") {
        if (prevCategory === newCategory) {
          // Same product/category: adjust by delta (new - prev)
          const delta = Math.round(newQty - prevQty);
          if (delta !== 0) {
            const prod = await findProductFor(newCategory);
            if (prod) {
              prod.stock = Math.max(0, (Number(prod.stock) || 0) - delta);
              await prod.save();
            }
          }
        } else {
          // Different categories: add back previous qty to old product, subtract new qty from new product
          const prodPrev = await findProductFor(prevCategory);
          if (prodPrev && prevQty > 0) {
            prodPrev.stock = Math.max(0, (Number(prodPrev.stock) || 0) + Math.round(prevQty));
            await prodPrev.save();
          }

          const prodNew = await findProductFor(newCategory);
          if (prodNew && newQty > 0) {
            prodNew.stock = Math.max(0, (Number(prodNew.stock) || 0) - Math.round(newQty));
            await prodNew.save();
          }
        }
      } else if (prevType === "Income" && newType !== "Income") {
        // Previously an income entry -> revert its stock decrement
        const prodPrev = await findProductFor(prevCategory);
        if (prodPrev && prevQty > 0) {
          prodPrev.stock = Math.max(0, (Number(prodPrev.stock) || 0) + Math.round(prevQty));
          await prodPrev.save();
        }
      } else if (prevType !== "Income" && newType === "Income") {
        // Newly turned into an income entry -> decrement stock for new category
        const prodNew = await findProductFor(newCategory);
        if (prodNew && newQty > 0) {
          prodNew.stock = Math.max(0, (Number(prodNew.stock) || 0) - Math.round(newQty));
          await prodNew.save();
        }
      }

      // Recompute top-selling category across all Income earnings and mark best-seller products
      const agg = await Earnings.aggregate([
        { $match: { type: "Income", category: { $ne: "" } } },
        { $group: { _id: "$category", totalQty: { $sum: "$quantity" } } },
        { $sort: { totalQty: -1 } },
        { $limit: 1 }
      ]);

      if (agg && agg.length > 0) {
        const topCategory = agg[0]._id;
        await Product.updateMany({}, { $set: { bestSeller: false } });
        await Product.updateMany({ $or: [{ category: topCategory }, { name: topCategory }] }, { $set: { bestSeller: true } });
      } else {
        // No income entries -> clear bestSeller
        await Product.updateMany({}, { $set: { bestSeller: false } });
      }

    } catch (e) {
      console.error('Error applying stock/best-seller update on earnings PUT:', e);
    }

    res.json({ message: "Earning updated successfully", earning });

  } catch (err) {
    console.error("Update earning failed:", err);
    res.status(500).json({ error: "Failed to update earning" });
  }
});

// ===========================
// DASHBOARD / REPORTS
// REPORTS
// ===========================
app.get("/api/reports", async (req, res) => {
  try {
    const todayIso = new Date().toISOString().split("T")[0];
    let report = await Report.findOne();
    if (!report) {
      report = new Report({ dailyEarnings: 0, dailyHistory: [] }); // PHP
      await report.save();
    }
    const lastEntry = report.dailyHistory[report.dailyHistory.length - 1];
    if (!lastEntry || lastEntry.date !== todayIso) {
      report.dailyHistory.push({ date: todayIso, total: 0 }); // PHP
      report.dailyEarnings = 0; // PHP
      await report.save();
    }
    // Daily earnings and history amounts are in PHP
    res.json({ dailyEarnings: report.dailyEarnings, dailyHistory: report.dailyHistory });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// ===========================
// CRON JOB
// ===========================
cron.schedule("0 0 * * *", async () => {
  const report = await Report.findOne();
  if (report) {
    report.dailyHistory.push({ date: new Date().toISOString().split("T")[0], total: report.dailyEarnings });
    report.dailyEarnings = 0;
    await report.save();
    console.log("Daily earnings reset to 0");
  }
}, { timezone: "Asia/Manila" });

cron.schedule("0 0 1 * *", async () => {
  const report = await Report.findOne();
  if (report) {
    // Save current month's total to history
    const now = new Date();
    const month = now.getMonth(); // last month
    const year = now.getFullYear();

    // Already tracked in monthlyHistory, just reset monthlyEarnings
    report.monthlyEarnings = 0;
    await report.save();
    console.log("Monthly earnings reset to 0");
  }
}, { timezone: "Asia/Manila" });

// ===========================  
// SERVER START
// ===========================
app.get("/", (req, res) => res.send("🚀 FarmOps Server Running"));
app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));