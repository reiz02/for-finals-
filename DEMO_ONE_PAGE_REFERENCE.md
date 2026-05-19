# 🚜 FarmOps Demo - One-Page Quick Reference

## SYSTEM OVERVIEW
**What is FarmOps?**  
Real-time farm management system for inventory, finance, employees, and complete audit tracking. Role-based access with 3 user types: Admin, Inventory Staff, Finance Staff.

---

## DEMO FLOW (19 minutes)

### 1️⃣ INTRO (2 min)
→ Explain 6 benefits (real-time, inventory, finance, employees, audit, reports)

### 2️⃣ ADMIN SETUP (3 min)
```
Navigate: http://localhost:3000
Click "Register as Admin" → Fill form
Email: admin@farmops.com | Pass: SecurePass@123
Create account → Login → Shows Dashboard
```

### 3️⃣ HIRE EMPLOYEES (4 min)
**New browser tab:**
```
Juan: Inventory section → juan@farmops.com | JuanPass@123
Maria: Finance section → maria@farmops.com | MariaPass@123
```
**Back in admin tab:**
```
Employee Management → Approve both → Status: ✅ Approved
```

### 4️⃣ ADD PRODUCTS (3 min)
**Juan's tab:**
```
Stock Management → Add Product
• Tomato: 100kg @ ₱25/kg (upload image)
• Lettuce: 80kg @ ₱15/kg (upload image)
```

### 5️⃣ ADD TRANSACTIONS (3 min)
**Maria's tab:**
```
Reports & Earnings → Add Daily Report
INCOME:  Date | Time 14:30 | Tomato | 50kg | ₱1,250
EXPENSE: Date | Time 09:00 | Seeds purchase | ₱500
Summary: Income ₱1,250 | Expense ₱500 | Net ₱750 ✅
```

### 6️⃣ DASHBOARD (2 min)
**Admin tab:** Dashboard → See real-time updates
```
Today's Earnings: ₱750 ✅
All-Time Income: ₱1,250 ✅
Best-Sellers: Tomato (50 units)
Earnings Chart: Visual graph
```

### 7️⃣ AUDIT LOG (1 min)
**Admin tab:** Audit Logs → Show complete activity trail
```
→ Juan added 2 products
→ Maria added income
→ Maria added expense
→ Click "Undo" to reverse any action ✅
```

### 8️⃣ ROLE-BASED ACCESS (1 min)
- Juan: Only sees Stock Management ✅
- Maria: Only sees Reports/Earnings ✅
- Admin: Sees EVERYTHING ✅

### 9️⃣ WRAP-UP (1 min)
Summarize features → Answer questions → Next steps

---

## DEMO CREDENTIALS

| User | Email | Password | Role | Access |
|------|-------|----------|------|--------|
| Admin | admin@farmops.com | SecurePass@123 | Admin | Everything |
| Juan | juan@farmops.com | JuanPass@123 | Inventory | Stock only |
| Maria | maria@farmops.com | MariaPass@123 | Finance | Reports only |

---

## KEY FEATURES TO HIGHLIGHT

✅ **Real-Time Updates**
- Dashboard auto-updates every 5 seconds
- Refresh page → All data persistent
- All users see same data instantly

✅ **Role-Based Security**
- Different users see different features
- Juan can't access Finance
- Maria can't access Inventory
- Admin sees everything

✅ **Product Management**
- Add/edit/delete products
- Upload images
- Smart merging (duplicate = increase qty)

✅ **Financial Tracking**
- Income with categorization & quantity
- Expense with description only
- Automatic totals (Gross - Expense = Net)

✅ **Complete Audit Trail**
- Every action logged
- Search & filter by user/action/entity
- Undo any action with confirmation

✅ **PDF Reports**
- Filter by quarter/year
- Export to PDF
- Show summary: Gross, Expenses, Net

✅ **Employee Management**
- Register with email verification
- Pending → Approved workflow
- Assign to section (Inventory/Finance)

---

## TROUBLESHOOTING QUICK FIXES

| Issue | Fix |
|-------|-----|
| Page won't load | Refresh (Ctrl+R) |
| Wrong redirect | Logout → Login again |
| Dashboard not updating | Refresh or wait 5 sec |
| Can't upload image | Check: <5MB, .jpg/.png format |
| Database error | Restart `npm run server` |
| Form validation fails | Check all required fields filled |

---

## OPTIONAL ADVANCED FEATURES (Time Permitting)

1. **Edit Transaction:** Click Edit → Change amount/date/time → Summary updates
2. **Edit Product:** Click Edit → Change stock → Dashboard updates
3. **More Transactions:** Add 3-4 more income/expense → Watch dashboard change
4. **Generate PDF:** Filter quarter → Click PDF → File downloads

---

## BUSINESS VALUE TALKING POINTS

💰 **Save Time:** All operations in one system (no multiple tools)
📊 **Real-Time Insight:** Know daily earnings instantly
🔒 **Secure:** Role-based access + complete audit trail
📈 **Professional:** Generate quarterly reports for stakeholders
👥 **Easy Management:** Simple employee approval workflow
💡 **Scalable:** Can add more staff anytime
🔄 **Mistake Recovery:** Undo any action if needed

---

## POST-DEMO ACTION ITEMS

- [ ] Answer questions
- [ ] Discuss implementation timeline
- [ ] Review data migration (if existing system)
- [ ] Collect feedback & feature requests
- [ ] Schedule staff training
- [ ] Send follow-up email with credentials & docs

---

## SYSTEM REQUIREMENTS FOR DEPLOYMENT

✓ MongoDB (or MongoDB Atlas cloud)
✓ Node.js + Express (backend)
✓ React (frontend)
✓ Email service (for verification codes)
✓ Hosting (AWS, Heroku, DigitalOcean, etc.)
✓ HTTPS/SSL certificate

---

**Print this page for quick reference during demo!** 📄✨
