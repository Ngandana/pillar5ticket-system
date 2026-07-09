# 📋 Pillar 5 Group — IT Ticketing System (v2.3)

**Complete Production-Ready System**  
**Latest Version:** 2.3  
**Date:** June 25, 2026  
**Contact:** s.ngandana@pillar5group.co.za

---

## ✨ What's New in v2.3

### 🎯 Simplified Registration
- ✅ **No email verification required** — Users register and log in immediately
- ✅ **Faster onboarding** — 1 click registration instead of 2-step process
- ✅ **Less friction** — No email inbox checking needed

### 🎨 Customizable Logo
- ✅ **Add your company logo** — Replace "P5" text with custom image
- ✅ **See LOGO_GUIDE.md** for detailed instructions
- ✅ **Works on login page, navbar, and more**

### 📍 New Office Zone
- ✅ **Call Center** — Replaces "IT Department"
- ✅ **6 desk stations** (CC-Desk-01 through CC-Desk-06)
- ✅ **Manager desk** for call center management

### 🔐 Forgot Password Still Included
- ✅ **Password reset via email** — 24-hour reset links
- ✅ **Outlook/Office 365 integration** — Company email support
- ✅ **@pillar5group.co.za domain only** — Security enforcement

---

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in root)
npm install
```

### 2. Configure Database

**Local PostgreSQL:**
```bash
psql -U postgres -c "CREATE DATABASE pillar5_tickets;"
psql -U postgres -d pillar5_tickets -f backend/db/schema.sql
```

**Or Railway PostgreSQL:**
- Go to railway.app and create new PostgreSQL instance
- Copy connection details

### 3. Setup Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your values
nano .env
```

**Required values:**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=pillar5_tickets

# Email (Outlook/Office 365)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your_email@pillar5group.co.za
SMTP_PASSWORD=your_16_char_app_password
MAIL_FROM=noreply@pillar5group.co.za

# Frontend
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET=your_very_long_random_string

# Server
PORT=5000
ALLOWED_ORIGIN=http://localhost:5173
```

### 4. Start Local Development

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

Visit: **http://localhost:5173**

---

## 👥 User Roles

### 🔒 SUPER_ADMIN
- Full system access
- Can assign tickets to staff
- Can escalate priority
- Can export audit logs
- **Default:** `s.ngandana@pillar5group.co.za` / `Admin@Pillar5!`

### 🔧 TECH_ADMIN (IT Support)
- View and respond to tickets
- Update ticket status
- Add internal notes
- Cannot assign or escalate

### 👤 EMPLOYEE
- Submit new tickets
- Chat with IT support
- View own tickets
- Can withdraw tickets

---

## 📋 Features

### Authentication
✅ Quick registration (no email verification)  
✅ Forgot password with email reset link  
✅ @pillar5group.co.za domain enforcement  
✅ 8-hour session tokens  
✅ Bcrypt password hashing  

### Ticketing
✅ 6 issue categories (Network, Password, Software, Hardware, Call Center, Other)  
✅ 4 priority levels (Low, Medium, High, Critical)  
✅ 5 status types (Open, In Progress, Waiting, Resolved, Withdrawn)  
✅ Image attachments (up to 10MB)  
✅ Real-time chat  

### Office Locations
✅ Main Office (6 desks + Reception)  
✅ Computer Lab (6 stations + Instructor desk)  
✅ **Call Center (6 desks + Manager desk)** ← NEW  

### Admin Dashboard
✅ KPI metrics (5 cards)  
✅ Triage queue with filters  
✅ Ticket detail view with full history  
✅ CSV export (SUPER_ADMIN only)  
✅ Role-based restrictions  

### Customization
✅ Custom company logo (see LOGO_GUIDE.md)  
✅ Dark theme UI  
✅ Responsive design  
✅ Mobile-friendly  

---

## 🏗️ Architecture

```
VERCEL (Frontend)
    ↓ HTTPS
RENDER (Backend API)
    ↓ TCP/5432
RAILWAY (PostgreSQL)
    ↑ SMTP (Port 587)
Office 365 (Email)
```

**Stack:**
- React 18 + Vite
- Node.js + Express
- PostgreSQL
- Nodemailer (Outlook SMTP)

---

## 📧 Outlook/Office 365 Setup

**1. Enable 2-Factor Authentication**
- Go to account.microsoft.com → Security
- Enable Two-step verification

**2. Create App Password**
- account.microsoft.com → Security → App passwords
- Select: Mail + Windows/Other
- Copy 16-character password

**3. Add to `.env`**
```env
SMTP_USER=your_email@pillar5group.co.za
SMTP_PASSWORD=<16_char_app_password>
```

**4. Test**
- Register new user
- Request "forgot password"
- Check email for reset link

---

## 🎨 Customizing Logo

See **LOGO_GUIDE.md** for complete instructions.

**Quick version:**
1. Add logo file to `public/logo.png`
2. Update `src/pages/AuthPage.jsx` to use `<img>` tag
3. Add CSS class for sizing
4. Restart dev server
5. Done!

---

## 🚀 Deployment

### To Render (Backend)

1. Push code to GitHub
2. Go to render.com → New Web Service
3. Select your repo
4. Configure:
   ```
   Root Directory: backend
   Build: npm install
   Start: npm start
   ```
5. Add environment variables
6. Deploy

### To Vercel (Frontend)

1. Connect GitHub repo to vercel.com
2. Add env variable:
   ```
   VITE_API_URL=https://your-render-api.onrender.com/api
   ```
3. Deploy

### To Railway (Database)

1. Create PostgreSQL project
2. Import `backend/db/schema.sql`
3. Get connection details
4. Add to Render environment variables

---

## 🔄 Migration from v2.1

If upgrading from v2.1:

1. Keep your PostgreSQL database (schema unchanged)
2. Update backend files:
   - `backend/routes/auth.js` (updated)
   - `backend/services/mail.js` (updated)
   - `src/lib/constants.js` (Call Center added)
3. Update frontend files:
   - `src/App.jsx` (routing updates)
   - `src/pages/AuthPage.jsx` (removed email verification)
4. Delete files no longer needed:
   - `src/pages/VerifyEmailPage.jsx` (optional)
5. Restart servers and test

---

## 🐛 Troubleshooting

### "Registration successful but can't log in"
- Check backend logs for errors
- Verify database connection
- Ensure user was created: `SELECT * FROM users;` in psql

### "Password reset email not arriving"
- Check SMTP credentials in `.env`
- Verify Outlook App Password is exactly 16 characters
- Check spam/junk folder
- Look for errors in backend console

### "Logo not showing"
- Ensure `public/logo.png` exists
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server
- Check file format (PNG or JPG)

### "Call Center doesn't appear in dropdown"
- Clear browser cache
- Verify `src/lib/constants.js` has Call Center
- Restart frontend dev server

### "CORS error"
- Update `ALLOWED_ORIGIN` in backend `.env`
- If using Vercel: Set to your Vercel domain
- Restart backend server

---

## 📊 Database Schema

### Updated tables:
- `users` — Company employees (email_verified auto TRUE on signup)
- `verification_tokens` — For password reset (email verification removed)
- `tickets` — Support tickets with office locations including Call Center
- `comments` — Ticket conversations
- `activity_logs` — Audit trail

---

## 🔐 Security

✅ Passwords hashed with bcrypt (12 rounds)  
✅ JWT tokens with 8-hour expiry  
✅ HTTPS required in production  
✅ Domain restriction (@pillar5group.co.za)  
✅ SQL injection prevention (parameterized queries)  
✅ XSS prevention (React escaping)  
✅ CORS protection  

---

## 📞 Support

**For issues:**
1. Check this README
2. See LOGO_GUIDE.md for logo setup
3. Check backend console for errors
4. Check browser console (F12) for frontend errors
5. Contact: s.ngandana@pillar5group.co.za

**Common file locations:**
- Backend config: `backend/.env`
- Logo file: `public/logo.png`
- Login page: `src/pages/AuthPage.jsx`
- Office zones: `src/lib/constants.js`

---

## 📝 Version History

| Version | Date | Notes |
|---------|------|-------|
| 2.3 | Jun 25, 2026 | Removed email verification, added custom logo, Call Center zone |
| 2.2 | Jun 25, 2026 | Forgot password, Outlook integration, domain restriction |
| 2.1 | May 28, 2026 | Email verification, tiered admin, role selector |
| 2.0 | May 22, 2026 | PostgreSQL migration, modular architecture |

---

## 🎯 Next Steps

1. ✅ Update logo (see LOGO_GUIDE.md)
2. ✅ Test all features locally
3. ✅ Deploy to production
4. ✅ Train users on password reset
5. ✅ Monitor Render logs for errors

---

**Ready to go!** 🚀

Built with ❤️ by Sibabalwe Ngandana
