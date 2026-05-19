# 🚜 FarmOps Quick Demo Checklist
## Ready-to-Use Walkthrough (Print-Friendly)

**Presenter:** _________________  
**Date:** _________________  
**Client:** _________________

---

## ⏱️ TIMING BREAKDOWN
- **Part 1:** Intro (2 min)
- **Part 2-3:** Admin Setup & Login (4 min)
- **Part 4:** Employee Registration & Approval (4 min)
- **Part 5:** Add Products (3 min)
- **Part 6:** Add Transactions (3 min)
- **Part 7:** Dashboard Review (2 min)
- **Part 8:** Audit Logs (1 min)
- **Total:** ~19 minutes

---

## PART 1: INTRODUCTION (2 minutes)

- [ ] Welcome & thank you for time
- [ ] Explain: "FarmOps = Complete Farm Management System"
- [ ] Show 6 key benefits on screen:
  - [ ] ✅ Real-time inventory tracking
  - [ ] ✅ Financial management (income/expense)
  - [ ] ✅ Employee management with approval workflow
  - [ ] ✅ Automatic audit logging
  - [ ] ✅ Role-based security
  - [ ] ✅ PDF report generation

---

## PART 2: ADMIN SETUP (3 minutes)

**System Status Check:**
- [ ] Verify MongoDB running: `npm run server` (Terminal 1)
- [ ] Verify Frontend running: `npm start` (Terminal 2)
- [ ] Navigate to `http://localhost:3000`

**Admin Registration:**
- [ ] Click "Register as Admin" link
- [ ] Fill form:
  - [ ] First Name: `[Business Owner Name]`
  - [ ] Last Name: `[Business Owner Name]`
  - [ ] Email: `admin@farmops.com`
  - [ ] Password: `SecurePass@123` *(highlight special char)*
  - [ ] Confirm Password: `SecurePass@123`
- [ ] Click "Create Admin Account"
- [ ] ✅ Show success message
- [ ] ✅ Redirected to login page

**Admin Login:**
- [ ] Email: `admin@farmops.com`
- [ ] Password: `SecurePass@123`
- [ ] Click "Login"
- [ ] ✅ Dashboard loads with sidebar
- [ ] **Point out:** Dashboard shows auto-updating metrics

---

## PART 3: EMPLOYEE REGISTRATION & APPROVAL (4 minutes)

### Employee #1: Juan (Inventory)

**Action:** Open new browser tab/window

- [ ] Go to `http://localhost:3000`
- [ ] Click "Register as Employee"
- [ ] Fill form:
  - [ ] First Name: `Juan`
  - [ ] Last Name: `Dela Cruz`
  - [ ] Email: `juan@farmops.com`
  - [ ] Password: `JuanPass@123`
  - [ ] Confirm: `JuanPass@123`
  - [ ] Section: **"Inventory"** *(Highlight this dropdown)*
  - [ ] Check "I agree to terms"
- [ ] Click "Register"
- [ ] ✅ Show success message & "Pending" status

### Employee #2: Maria (Finance)

- [ ] Go back to login page
- [ ] Click "Register as Employee"
- [ ] Fill form:
  - [ ] First Name: `Maria`
  - [ ] Last Name: `Santos`
  - [ ] Email: `maria@farmops.com`
  - [ ] Password: `MariaPass@123`
  - [ ] Confirm: `MariaPass@123`
  - [ ] Section: **"Finance"** *(Highlight this dropdown)*
  - [ ] Check "I agree to terms"
- [ ] Click "Register"
- [ ] ✅ Show success message & "Pending" status

### Admin Approves Employees

**Action:** Switch back to admin tab

- [ ] Click "Employee Management" in sidebar
- [ ] ✅ Show table with 2 pending employees
- [ ] Find Juan's row → Click "Approve"
  - [ ] ✅ Status changes to ✅ "Approved"
- [ ] Find Maria's row → Click "Approve"
  - [ ] ✅ Status changes to ✅ "Approved"
- [ ] **Point out:** "Now they can log in"

---

## PART 4: ADD PRODUCTS (3 minutes)

### Juan Logs In

**Action:** Open new browser tab

- [ ] Go to `http://localhost:3000/login`
- [ ] Email: `juan@farmops.com`
- [ ] Password: `JuanPass@123`
- [ ] Click "Login"
- [ ] ✅ Auto-redirected to Stock Management
- [ ] **Explain:** "Juan only sees inventory because he's Inventory section"

### Add First Product: Tomatoes

- [ ] Click "Add Product" or similar button
- [ ] Fill form:
  - [ ] Category: **"Tomato"** *(Select from dropdown)*
  - [ ] Price: `25` *(₱25 per kilo)*
  - [ ] Stock: `100` *(100 kilos)*
  - [ ] Unit: **"kilo"** *(Select from dropdown)*
- [ ] (Optional) Upload image: Click upload, select tomato image
- [ ] Click "Add Product"
- [ ] ✅ Success message
- [ ] ✅ Product appears in list below

### Add Second Product: Lettuce

- [ ] Click "Add Product" again
- [ ] Fill form:
  - [ ] Category: **"Lettuce"**
  - [ ] Price: `15` *(₱15 per kilo)*
  - [ ] Stock: `80` *(80 kilos)*
  - [ ] Unit: **"kilo"**
- [ ] (Optional) Upload image
- [ ] Click "Add Product"
- [ ] ✅ Success message
- [ ] ✅ 2 products now in list

**Highlight:**
- [ ] "Smart merging: Adding duplicate increases quantity"
- [ ] "Products now visible on admin dashboard"

---

## PART 5: ADD FINANCIAL TRANSACTIONS (3 minutes)

### Maria Logs In

**Action:** Open new browser tab

- [ ] Go to `http://localhost:3000/login`
- [ ] Email: `maria@farmops.com`
- [ ] Password: `MariaPass@123`
- [ ] Click "Login"
- [ ] ✅ Auto-redirected to Reports & Earnings
- [ ] **Explain:** "Maria only sees finance because she's Finance section"

### Add Income Transaction

- [ ] Fill "Add Daily Report" form:
  - [ ] Date: `[Pick today's date]`
  - [ ] Time: `14:30` *(2:30 PM)*
  - [ ] Type: **"Income"** *(Select from dropdown)*
  - [ ] Category: **"Tomato"** *(Dropdown appears when Income selected)*
  - [ ] Quantity: `50`
  - [ ] Unit: **"kilo"**
  - [ ] Amount: `1250` *(₱1,250)*
- [ ] Click "Submit"
- [ ] ✅ Confirmation popup appears
- [ ] Click "Confirm"
- [ ] ✅ Success message
- [ ] ✅ Transaction appears in history below

**Highlight:**
- [ ] "Time picker allows exact timestamp"
- [ ] "Quantity auto-calculates: ₱25 × 50 = ₱1,250"

### Add Expense Transaction

- [ ] Fill form again:
  - [ ] Date: `[Pick today's date]`
  - [ ] Time: `09:00` *(9:00 AM)*
  - [ ] Type: **"Expense"** *(Select from dropdown)*
  - [ ] **Note:** "Category dropdown DISAPPEARS, shows text field instead"
  - [ ] Description: `Seeds and fertilizer` *(Type in text field)*
  - [ ] Amount: `500` *(₱500)*
  - [ ] **Note:** "No quantity field for expenses"
- [ ] Click "Submit"
- [ ] ✅ Confirmation popup
- [ ] Click "Confirm"
- [ ] ✅ Success message
- [ ] ✅ Expense appears in history

**Highlight:** "Difference between Income (categorized) vs Expense (descriptive)"

### View Financial Summary

- [ ] Show summary box:
  - [ ] ✅ Gross Income: ₱1,250
  - [ ] ✅ Total Expenses: ₱500
  - [ ] ✅ Net Income: ₱750
- [ ] **Explain:** "Calculated automatically in real-time"

---

## PART 6: REAL-TIME DASHBOARD (2 minutes)

### Switch Back to Admin Tab

- [ ] Click "Dashboard" in sidebar
- [ ] Refresh if needed

### Show Real-Time Updates

- [ ] **Point to metrics:**
  - [ ] ✅ "Today's Net Earnings: ₱750"
  - [ ] ✅ "Total All-Time Income: ₱1,250"
  - [ ] "This auto-updates every 5 seconds"

- [ ] **Best-Selling Products Carousel:**
  - [ ] ✅ Show Tomato card (50 units sold)
  - [ ] ✅ Show Lettuce card (80 units in stock)

- [ ] **Earnings Chart:**
  - [ ] ✅ Show graph with today's ₱750 plotted
  - [ ] "Visualize trends over time"

- [ ] **Live Clock:**
  - [ ] ✅ Show current date/time updating

**Highlight:**
- [ ] "All data updated in REAL-TIME"
- [ ] "Multiple users see same data instantly"

---

## PART 7: AUDIT LOG (1 minute)

### Click "Audit Logs" in Sidebar

- [ ] ✅ Show audit log table
- [ ] **Point out activities:**
  - [ ] Juan added 2 products
  - [ ] Maria added income transaction
  - [ ] Maria added expense transaction

### Show Audit Features

- [ ] **Search:** Show search bar for user names
- [ ] **Filter:** Show entity type filters
- [ ] **Undo Button:** "Click to reverse any action"
  - [ ] Demo: Click "Undo" on any action
  - [ ] ✅ Show confirmation popup
  - [ ] Confirm undo
  - [ ] ✅ Action reversed (product deleted, transaction removed, etc.)

**Highlight:**
- [ ] "Complete activity trail"
- [ ] "Easy mistake recovery"
- [ ] "Full accountability"

---

## PART 8: ROLE-BASED ACCESS DEMO (1 minute)

### Demonstrate Access Control

**Switch to Juan's Tab (Inventory):**
- [ ] ✅ Can see: Stock Management
- [ ] ✅ Can see: Dashboard (read-only)
- [ ] ❌ Cannot see: Reports/Earnings
- [ ] ❌ Cannot see: Employee Management
- [ ] ❌ Cannot see: Audit Logs

**Switch to Maria's Tab (Finance):**
- [ ] ✅ Can see: Reports & Earnings
- [ ] ✅ Can see: Dashboard (read-only)
- [ ] ❌ Cannot see: Stock Management
- [ ] ❌ Cannot see: Employee Management
- [ ] ❌ Cannot see: Audit Logs

**Switch to Admin Tab:**
- [ ] ✅ Can see: EVERYTHING
- [ ] ✅ Dashboard, Stock, Reports, Employees, Audit Logs

**Point Out:** "Security by role - each person sees only what they need"

---

## PART 9: ADVANCED FEATURES (Optional - 2 minutes)

### Optional if time allows:

#### Edit Product Stock
- [ ] Go to Juan's tab (Stock Management)
- [ ] Find Tomato product
- [ ] Click "Edit"
- [ ] Change stock to `150` (simulating new arrival)
- [ ] Click "Save"
- [ ] ✅ Dashboard updates to show ₱1,250 + new sales

#### Edit Transaction
- [ ] Go to Maria's tab (Reports)
- [ ] Click "Edit" on a transaction
- [ ] Change amount/date/time
- [ ] Click "Update"
- [ ] ✅ Summary recalculates automatically

#### Export to PDF
- [ ] Go to Maria's tab (Reports)
- [ ] Select Year: `2026`, Quarter: `Q2 (Apr - Jun)`
- [ ] Click "Generate Report" (filter)
- [ ] Click "PDF" button
- [ ] ✅ Shows: Date, all transactions, summary totals
- [ ] ✅ PDF downloaded to Downloads folder

#### Add More Data (Optional)
- [ ] Maria adds more income/expense transactions
- [ ] Watch dashboard update in real-time
- [ ] Notice metrics changing

---

## PART 10: WRAP-UP (1 minute)

### Summary of What We Showed

- [ ] ✅ Admin setup & secure login
- [ ] ✅ Employee registration & approval workflow
- [ ] ✅ Product inventory management
- [ ] ✅ Income/expense tracking with exact timestamps
- [ ] ✅ Real-time dashboard with auto-updates
- [ ] ✅ Complete audit trail with undo
- [ ] ✅ Role-based access control
- [ ] ✅ Quarterly reporting with PDF export

### Key Business Value

- [ ] 📊 "Real-time visibility into your farm operations"
- [ ] 💼 "All departments (Inventory & Finance) in one system"
- [ ] 👥 "Easy team management - approve & assign roles"
- [ ] 📋 "Complete audit trail - never lose information"
- [ ] 🔒 "Secure - each employee sees only their area"
- [ ] 📈 "Professional reports - quarterly PDFs for stakeholders"
- [ ] ⚡ "Fast & efficient - spend less time on paperwork"

### Next Steps

- [ ] Answer questions
- [ ] Discuss deployment timeline
- [ ] Review data migration (if needed)
- [ ] Schedule staff training
- [ ] Get feedback/feature requests
- [ ] Provide login credentials

---

## 🆘 TROUBLESHOOTING DURING DEMO

| Problem | Solution | Backup |
|---------|----------|--------|
| Page not loading | Refresh (Ctrl+R) | Restart `npm start` |
| Login fails | Clear localStorage → Refresh | Restart both servers |
| Dashboard not updating | Refresh page | Wait 5 seconds for auto-update |
| Image upload fails | Check file size (<5MB), format (.jpg/.png) | Skip image, explain feature works |
| Redirect wrong page | Log out & log in again | Check employee section assignment |
| Slow performance | Close other tabs | Natural demo pacing |

---

## 📋 DEMO CREDENTIALS (COPY & KEEP HANDY)

```
ADMIN:
Email: admin@farmops.com
Pass: SecurePass@123

JUAN (Inventory):
Email: juan@farmops.com
Pass: JuanPass@123

MARIA (Finance):
Email: maria@farmops.com
Pass: MariaPass@123
```

---

## 📸 VISUAL SCREENSHOTS TO HIGHLIGHT

- [ ] Dashboard with real-time metrics
- [ ] Product list with images
- [ ] Financial summary (Gross, Expense, Net)
- [ ] Transaction history table
- [ ] Earnings chart/graph
- [ ] Employee management pending/approved
- [ ] Audit log with actions
- [ ] PDF report

---

## ✅ POST-DEMO CHECKLIST

- [ ] Answer all questions
- [ ] Collect feedback
- [ ] Ask about feature additions
- [ ] Discuss timeline & budget
- [ ] Schedule training session
- [ ] Send follow-up email with:
  - [ ] Demo credentials
  - [ ] System requirements
  - [ ] Deployment roadmap
  - [ ] Training schedule

---

**Demo Status:** Ready to Impress! 🚀

*Print this checklist and check off each step as you go through the demo.*
