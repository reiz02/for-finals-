# 🚜 FarmOps System Demo Script
## Complete End-to-End Walkthrough for Business Owner

**Duration:** ~15-20 minutes  
**Objective:** Demonstrate all core features from admin setup to completed data entry

---

## 📋 PART 1: SYSTEM INTRODUCTION (2 minutes)

### What is FarmOps?
FarmOps is a **real-time farm management system** designed to help agricultural businesses:
- ✅ Track inventory (products, stock levels, pricing)
- ✅ Manage finances (record income/expenses, generate quarterly reports)
- ✅ Oversee employees (register, approve, manage access)
- ✅ Monitor performance (view earnings, best-sellers, daily trends)
- ✅ Maintain complete audit trail (log all system activities)

**Key Benefits:**
- 🎯 Real-time dashboard with auto-updates every 5 seconds
- 📊 Quarterly financial reports with PDF export
- 👥 Role-based access control (Admin, Inventory, Finance staff)
- 📱 Mobile-friendly interface
- 🔒 Secure login with email verification

---

## 🚀 PART 2: INITIAL SYSTEM SETUP - CREATE ADMIN ACCOUNT (3 minutes)

**Navigate to:** `http://localhost:3000`  
**Current page:** Login page

### Step 1: Go to Admin Registration
1. Look for the login form
2. Find the link **"Register as Admin"** at the bottom
3. **Click it** → Redirects to `/register-admin` page

### Step 2: Fill Admin Registration Form
Fill in the following details:
- **First Name:** `[Business Owner's First Name]` *(Auto-capitalizes)*
- **Middle Name:** `[Optional]`
- **Last Name:** `[Business Owner's Last Name]` *(Auto-capitalizes)*
- **Email:** `admin@farmops.com` *(Will receive verification code)*
- **Password:** `SecurePass@123` *(Must include special character like @, #, $, %, &)*
- **Confirm Password:** `SecurePass@123` *(Must match)*
- **Security Question:** Select security question and provide answer

### Step 3: Submit Registration
1. **Click "Create Admin Account"** button
2. See success message: "Admin account created successfully!"
3. **You'll be redirected to login page**

### Step 4: Email Verification (Optional in Demo)
- In real scenario: Check email for 6-digit verification code
- Code is sent to the email provided above
- Click "Verify Email" button and enter the code
- *In demo environment, this may auto-verify*

---

## 🔑 PART 3: LOGIN WITH ADMIN ACCOUNT (1 minute)

### Step 1: Login Form
1. **Email:** `admin@farmops.com`
2. **Password:** `SecurePass@123`
3. **Click "Login"** button

### Step 2: Dashboard Loads
**You'll see:** Admin dashboard with:
- 📊 **Today's Net Earnings:** Shows current day's profit
- 💰 **Total All-Time Income:** Cumulative earnings
- 🏆 **Best-Selling Products:** Carousel (initially empty - we'll add products)
- 📈 **Earnings Chart:** Graph of daily trends
- ⏰ **Live Clock:** Current date and time

**Navigation Sidebar appears with:**
- 📊 Dashboard
- 📦 Stock Management
- 💰 Reports & Earnings
- 👥 Employee Management
- 📋 Audit Logs

---

## 👥 PART 4: REGISTER & APPROVE EMPLOYEES (4 minutes)

### Scenario: Hiring Two Employees
We'll register:
1. **Juan Dela Cruz** - Inventory Manager
2. **Maria Santos** - Finance Officer

### Step 4A: Employee #1 Registration (Inventory)

#### Action: Open New Browser Tab/Window
1. **Open new tab** - Go to `http://localhost:3000`
2. **Click "Register as Employee"** link

#### Fill Employee Registration Form:
- **First Name:** `Juan`
- **Last Name:** `Dela Cruz`
- **Email:** `juan@farmops.com`
- **Password:** `JuanPass@123` *(Special character required)*
- **Confirm Password:** `JuanPass@123`
- **Section:** Select **"Inventory"** from dropdown
  - *This determines what features Juan can access*
- **Agree to Terms:** Check the checkbox

#### Click "Register"
- Success message: "Registration successful!"
- Account created with status: **"Pending"** *(Waiting for admin approval)*

---

### Step 4B: Employee #2 Registration (Finance)

#### In the same new tab:
1. **Go back to login page** (or click "Register another employee")
2. Repeat registration with:
- **First Name:** `Maria`
- **Last Name:** `Santos`
- **Email:** `maria@farmops.com`
- **Password:** `MariaPass@123`
- **Confirm Password:** `MariaPass@123`
- **Section:** Select **"Finance"** from dropdown
  - *Maria will handle financial reports*

#### Click "Register"
- Success message: "Registration successful!"
- Account created with status: **"Pending"**

---

### Step 4C: Admin Approves Employees

#### Back to Admin Tab:
1. **Switch back to the admin tab** (where you're logged in as admin)
2. **Click "Employee Management"** in the sidebar

#### You'll see: Employee Management Page
Shows table with:
| Name | Email | Section | Status | Action |
|------|-------|---------|--------|--------|
| Juan Dela Cruz | juan@farmops.com | Inventory | ⏳ **Pending** | **[Approve]** |
| Maria Santos | maria@farmops.com | Finance | ⏳ **Pending** | **[Approve]** |

#### Approve Juan:
1. Find Juan's row
2. **Click "Approve" button**
3. Status changes to: ✅ **Approved**
4. Juan can now log in

#### Approve Maria:
1. Find Maria's row
2. **Click "Approve" button**
3. Status changes to: ✅ **Approved**
4. Maria can now log in

**Page updates in real-time** (every 5 seconds)

---

## 📦 PART 5: ADD PRODUCTS TO INVENTORY (3 minutes)

### Step 5A: Login as Juan (Inventory Employee)

#### In new tab/window:
1. **Go to login page** `http://localhost:3000/login`
2. **Email:** `juan@farmops.com`
3. **Password:** `JuanPass@123`
4. **Click "Login"**

#### After Login:
- **Auto-redirected to Stock Management page** (because Juan is Inventory section)
- Juan sees: Stock Management dashboard (initially empty)

---

### Step 5B: Add First Product - Tomatoes

#### Click "Add Product" or similar button:

Fill in product details:
- **Category:** Select **"Tomato"** from dropdown
  - *(Available options: Lettuce, Pechay, Tomato, Eggplant, Okra)*
- **Price per Unit:** `25` *(PHP 25 per kilo)*
- **Stock Quantity:** `100` *(100 kilos available)*
- **Unit:** Select **"kilo"** from dropdown

#### Upload Product Image (Optional):
1. Click image upload button
2. Select a tomato image from your computer
3. Preview appears before submission

#### Click "Add Product" Button
- Success message: "Product added successfully!"
- **Tomato now appears in the product list**

#### Product Entry Shows:
- Category: Tomato
- Price: ₱25/kilo
- Stock: 100 kilos
- [Edit] [Delete] buttons

---

### Step 5C: Add Second Product - Lettuce

#### Click "Add Product" again:

Fill in details:
- **Category:** Select **"Lettuce"** from dropdown
- **Price per Unit:** `15` *(PHP 15 per kilo)*
- **Stock Quantity:** `80` *(80 kilos)*
- **Unit:** Select **"kilo"**

#### Upload Image (Optional)

#### Click "Add Product"
- Success message: "Product added successfully!"
- **Lettuce appears in list**

---

### Step 5D: Edit Product Stock (Optional Demo)

Scenario: More tomatoes arrived

1. Find **Tomato** in product list
2. **Click "Edit" button**
3. Change **Stock Quantity** to `150` *(100 + 50 new)*
4. **Click "Save"**
5. System confirms: "Product updated!"
6. Tomato stock now shows `150 kilos`

**Note:** If adding duplicate product (same category), system automatically merges quantities!

---

## 💰 PART 6: RECORD FINANCIAL TRANSACTIONS (3 minutes)

### Step 6A: Login as Maria (Finance Employee)

#### In new tab/window:
1. **Go to login:** `http://localhost:3000/login`
2. **Email:** `maria@farmops.com`
3. **Password:** `MariaPass@123`
4. **Click "Login"**

#### After Login:
- **Auto-redirected to Reports & Earnings page** (because Maria is Finance section)
- Maria sees: Daily report form and transaction history

---

### Step 6B: Add Daily Income Report

#### Income Transaction - Tomato Sales

**Fill in the "Add Daily Report" form:**

- **Date:** `[Today's date]` *(Use date picker)*
- **Time:** `14:30` *(Use time picker - 2:30 PM)*
- **Type:** Select **"Income"** from dropdown
- **Category:** Select **"Tomato"** *(Drop-down appears only for Income)*
- **Quantity:** `50` *(50 kilos sold)*
- **Unit:** Select **"kilo"** from dropdown
- **Amount:** `1250` *(₱25/kilo × 50 kilos = ₱1,250)*

#### Click "Submit"
- Confirmation popup appears: "Submit Income report for 50 units of Tomato?"
- Click "Confirm"
- Success message: "Daily report added successfully!"

#### Form Resets:
- Date/time update to current
- Fields clear for next entry

---

### Step 6C: Add Daily Expense Report

#### Expense Transaction - Seeds Purchase

**In the same "Add Daily Report" form:**

- **Date:** `[Today's date]`
- **Time:** `09:00` *(9:00 AM - morning purchase)*
- **Type:** Select **"Expense"** from dropdown
- **Description:** `Seeds and fertilizer purchase` *(Text input appears instead of category dropdown)*
- **Amount:** `500` *(₱500 spent)*

**Note:** 
- No quantity field for Expense
- No category dropdown for Expense
- Just description in text input

#### Click "Submit"
- Confirmation popup: "Submit Expense of P500?"
- Click "Confirm"
- Success message: "Daily report added successfully!"

---

### Step 6D: View Transaction History & Summary

#### Financial Summary Section Shows:
```
┌─────────────────────────────────────────┐
│ FINANCIAL SUMMARY (Today)               │
├─────────────────────────────────────────┤
│ Total/Gross Income:  ₱1,250             │
│ Total Expenses:      ₱500               │
│ Net Income:          ₱750               │
└─────────────────────────────────────────┘
```

#### Transaction History Table Shows:
| Date & Time | Description | Type | Quantity | Amount | Added By |
|-------------|-------------|------|----------|--------|----------|
| May 19, 2026 2:30 PM | Tomato (kilo) | Income | 50 | ₱1,250 | Maria Santos |
| May 19, 2026 9:00 AM | Seeds and fertilizer purchase | Expense | - | ₱500 | Maria Santos |

#### Additional Features:
- **Edit:** Click to modify transaction details
- **Delete:** Remove transaction with confirmation
- **Year Filter:** Select 2025, 2026, 2027, etc.
- **Quarter Filter:** Choose Q1, Q2, Q3, Q4
- **Generate Report:** Filter and recalculate totals
- **Export to PDF:** Download quarterly report

---

## 📊 PART 7: VIEW ADMIN DASHBOARD (REAL-TIME UPDATES) (2 minutes)

### Step 7A: Switch Back to Admin Tab

1. **Go back to admin tab** (where logged in as admin)
2. **Click "Dashboard"** in sidebar (or refresh if needed)

---

### Step 7B: Dashboard Shows Real-Time Updates

#### Top Metrics Update:
```
TODAY'S NET EARNINGS:   ₱750  (Income ₱1,250 - Expense ₱500)
TOTAL ALL-TIME INCOME:  ₱1,250
```

#### Best-Selling Products Carousel:
- Shows **Tomato** (50 units sold recently)
- Shows **Lettuce** (80 units available)
- Can click arrows to scroll through products

#### Earnings Chart:
- Shows graph with **today's net earning: ₱750** plotted
- If you add more data, chart updates dynamically

#### Live Features:
- **🕐 Live Clock:** Displays current date and time
- **🔄 Auto-Refresh:** Updates every 5 seconds
- **📊 Real-Time:** All changes reflect immediately

---

## 📋 PART 8: AUDIT LOG TRACKING (1 minute)

### Step 8: View Complete Activity Log

#### Click "Audit Logs" in Admin Sidebar

#### Audit Log Table Shows:

| Action | User | Role | Entity | Details | Timestamp |
|--------|------|------|--------|---------|-----------|
| Added | Juan Dela Cruz | Inventory | Product | Added Tomato: 100 kg @ ₱25 | May 19, 2:30 PM |
| Added | Juan Dela Cruz | Inventory | Product | Added Lettuce: 80 kg @ ₱15 | May 19, 2:35 PM |
| Added | Maria Santos | Finance | Income | Tomato sales: 50 units, ₱1,250 | May 19, 2:30 PM |
| Added | Maria Santos | Finance | Expense | Seeds purchase: ₱500 | May 19, 9:00 AM |

#### Features:
- **Search:** Find logs by user name, role, action type
- **Filter:** View specific entity types (products, transactions, etc.)
- **Undo:** Click "Undo" to reverse any action
  - Example: Undo product deletion → Product restored
  - Example: Undo transaction → Entry removed from reports

---

## 🔄 PART 9: ROLE-BASED ACCESS DEMO (2 minutes)

### Demonstrate Access Control

#### Juan (Inventory Employee) Can:
- ✅ View and manage Stock/Products
- ✅ Add/Edit/Delete products
- ✅ Upload product images
- ✅ View Dashboard (read-only)
- ❌ Cannot access Reports/Earnings
- ❌ Cannot access Employee Management
- ❌ Cannot access Audit Logs

#### Maria (Finance Employee) Can:
- ✅ View and manage Financial Reports
- ✅ Record Income/Expenses
- ✅ Filter by Quarter/Year
- ✅ Export to PDF
- ✅ View Dashboard (read-only)
- ❌ Cannot access Stock Management
- ❌ Cannot access Employee Management
- ❌ Cannot access Audit Logs

#### Admin Can:
- ✅ Access EVERYTHING
- ✅ View all reports
- ✅ Manage employees
- ✅ View audit logs
- ✅ Undo any action
- ✅ View dashboard

---

## 📱 PART 10: KEY FEATURES SUMMARY (2 minutes)

### Feature Demonstration Summary

| Feature | How to Show | Business Value |
|---------|------------|-----------------|
| **Real-Time Dashboard** | Show auto-updates every 5 seconds, refresh page → metrics unchanged | Always have current financial status |
| **Product Management** | Add/Edit/Delete products, upload images | Complete inventory control |
| **Income/Expense Tracking** | Record multiple transactions with date/time | Accurate financial records |
| **Quarterly Reports** | Filter by Q1-Q4, show summary calculations | Understand profitability by period |
| **PDF Export** | Generate & download quarterly report | Share reports with stakeholders |
| **Employee Approval Workflow** | Show pending → approved transition | Control who accesses system |
| **Audit Trail** | Show all logged actions with undo | Complete accountability & mistake recovery |
| **Role-Based Access** | Login as different users, show different pages | Secure access control |

---

## 💾 PART 11: DATA PERSISTENCE (Optional Deep Dive)

### Explain Data Storage:
1. **All data is saved to MongoDB database** *(persistent)*
2. **Survives browser refresh/logout**
3. **Multiple users can access simultaneously**
4. **Real-time sync** between all connected users

### Demo:
1. Record transaction as Maria
2. **Refresh page** → Transaction still there
3. **Log out** → Log back in → Transaction still there
4. **Switch to admin** → Can see same transactions
5. **All changes reflected in real-time** across all users

---

## 🎯 PART 12: WRAP-UP & KEY TAKEAWAYS (1 minute)

### System Successfully Demonstrated:

✅ **Admin Setup** - Created secure admin account with verification  
✅ **Employee Management** - Registered and approved 2 employees  
✅ **Inventory Management** - Added 2 products with pricing & images  
✅ **Financial Tracking** - Recorded income & expense transactions  
✅ **Real-Time Reporting** - Dashboard updated with new data  
✅ **Audit Trail** - Complete activity log with undo capability  
✅ **Role-Based Security** - Different access for different users  

### Business Value Delivered:

1. **📊 Real-Time Visibility** → Know daily earnings instantly
2. **💼 Organized Operations** → Inventory + Finance tracked in one system
3. **👥 Team Management** → Easily add/approve employees
4. **📋 Complete Audit Trail** → Never lose track of what happened
5. **🔒 Secure Access Control** → Different roles, appropriate access
6. **📈 Professional Reporting** → Generate quarterly reports & PDFs
7. **⚡ Automated Workflows** → Real-time dashboard, auto-updating

---

## 🚀 NEXT STEPS FOR DEPLOYMENT

### Production Readiness:
1. **Set up MongoDB database** (production server)
2. **Configure email service** for employee verification codes
3. **Deploy to hosting provider** (AWS, Heroku, DigitalOcean)
4. **Enable SSL/HTTPS** for security
5. **Set backup schedule** for database
6. **Create user documentation** for employees
7. **Conduct staff training** on system usage

### Ongoing Maintenance:
- Monitor system performance
- Regular backups
- User support
- Feature updates based on feedback
- Security patches

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues:

| Issue | Solution |
|-------|----------|
| Password won't accept | Must include special character (@, #, $, %, &) |
| Verification code not received | Check email spam folder or click "Resend Code" |
| Employee not seeing approved status | Refresh page - updates every 5 seconds |
| Transaction not appearing in report | Ensure date is within selected quarter/year |
| Images not uploading | Ensure file is .jpg, .png, .gif (< 5MB) |

---

## 📝 DEMO CREDENTIALS (For Reference)

**Admin Account:**
- Email: `admin@farmops.com`
- Password: `SecurePass@123`
- Role: Admin
- Access: Everything

**Employee #1:**
- Email: `juan@farmops.com`
- Password: `JuanPass@123`
- Role: Employee
- Section: Inventory
- Access: Stock Management

**Employee #2:**
- Email: `maria@farmops.com`
- Password: `MariaPass@123`
- Role: Employee
- Section: Finance
- Access: Reports & Earnings

---

**End of Demo Script**

*Total Time: 15-20 minutes for complete walkthrough*  
*Ready to deploy and start using FarmOps!* 🚜✨
