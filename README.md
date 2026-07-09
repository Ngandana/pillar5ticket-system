# Pillar 5 Group — IT Ticketing System

**Contact:** s.ngandana@pillar5group.co.za

---

## Latest Features (v2.1)

✨ **Email Verification** — Users must verify their email before logging in  
🔧 **Tiered Admin System** — SUPER_ADMIN (full control) vs TECH_ADMIN (respond only)  
🔐 **Role-Based Registration** — Users choose Employee or IT Support role on signup  
📧 **Email Notifications** — Verification links sent via SMTP  

---

## Tech Stack

- **Frontend:** React 18 + Vite (Vercel)
- **Backend:** Node.js + Express (Render)
- **Database:** PostgreSQL (Railway)
- **Email:** Nodemailer (Gmail SMTP)

---

## Quick Deployment (Render + Railway)

👉 **See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for complete step-by-step guide**

---

## Local Development (Windows / PowerShell)

### 1. PostgreSQL Setup

```powershell
# Install PostgreSQL, then create database:
psql -U postgres -c "CREATE DATABASE pillar5_tickets;"
psql -U postgres -d pillar5_tickets -f backend\db\schema.sql
```

### 2. Backend

```powershell
cd backend
copy .env.example .env
# Edit .env with your PostgreSQL + Gmail SMTP credentials
npm install
npm run dev
```

### 3. Frontend

```powershell
npm install
npm run dev
```

Open **http://localhost:5173**

---

## .env Configuration

### PostgreSQL
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=pillar5_tickets
```

### Email (Gmail + Nodemailer)
1. Enable 2FA on your Gmail account
2. Generate an **App Password** (not your regular password)
3. Add to .env:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password_16_chars
MAIL_FROM=noreply@pillar5group.co.za
FRONTEND_URL=http://localhost:5173
```

### JWT & Server
```env
JWT_SECRET=long_random_string_minimum_32_characters
PORT=5000
ALLOWED_ORIGIN=http://localhost:5173
NODE_ENV=development
```

---

## User Roles

### 🔒 SUPER_ADMIN (System Admin)
- Full access to admin dashboard
- Can assign tickets to technicians
- Can escalate ticket priority
- Can access audit logs & exports
- Cannot be assigned tickets directly

**Default account:**
- Email: `s.ngandana@pillar5group.co.za`
- Password: `Admin@Pillar5!`
- Pre-verified (no email confirmation needed)

### 🔧 TECH_ADMIN (IT Support)
- Access admin triage queue
- Can update ticket status
- Can respond to tickets
- **Cannot** assign tickets
- **Cannot** escalate priority
- **Cannot** access audit logs

Can only escalate their own lower/equal-level changes.

### 👤 EMPLOYEE (Regular User)
- Submit tickets (2-step form)
- Communicate with IT team
- Withdraw their own tickets
- No admin access

---

## Registration Flow

1. User clicks "Create Account"
2. Selects role: **Employee** or **IT Support**
3. Enters name, email, password
4. System sends verification email
5. User clicks link in email
6. Account activated, can now log in

---

## Features

- ✅ Email verification with 24-hour token expiry
- ✅ Tiered role-based access control
- ✅ Self-service employee ticket submission
- ✅ Two-way live chat between employees & IT
- ✅ Admin triage queue with filters
- ✅ 5 KPI dashboard cards
- ✅ Image attachment support
- ✅ Full audit trail
- ✅ CSV export (SUPER_ADMIN only)
- ✅ Soft-delete tickets (withdraw)
- ✅ Dark theme UI

---

## Project Structure

```
pillar5-ticket-system/
├── backend/
│   ├── db/
│   │   ├── init.js
│   │   └── schema.sql
│   ├── middleware/
│   │   ├── auth.js (role-based access)
│   │   └── upload.js
│   ├── routes/
│   │   ├── auth.js (email verification)
│   │   ├── tickets.js
│   │   └── admin.js (role restrictions)
│   ├── services/
│   │   └── mail.js (email sending)
│   ├── server.js
│   ├── fix-admin.js
│   ├── package.json
│   └── .env.example
│
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   │   ├── AuthPage.jsx (with role selector)
│   │   ├── VerifyEmailPage.jsx (NEW)
│   │   ├── AdminPage.jsx
│   │   └── EmployeePage.jsx
│   ├── App.jsx (email verification routing)
│   ├── index.css
│   └── main.jsx
│
├── RENDER_DEPLOYMENT.md
├── README.md
└── package.json
```

---

## Default Credentials

| Field    | Value                             |
|----------|-----------------------------------|
| Email    | s.ngandana@pillar5group.co.za     |
| Password | Admin@Pillar5!                    |
| Role     | SUPER_ADMIN (pre-verified)        |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Email not verified" on login | User must click verification link in email first |
| Email not sending | Check SMTP credentials in .env (Gmail needs App Password, not regular password) |
| `connect ECONNREFUSED` | PostgreSQL not running |
| Role not appearing in admin | User must have `SUPER_ADMIN` or `TECH_ADMIN` role |
| TECH_ADMIN can't assign | By design — only SUPER_ADMIN can assign |

---

## Deployment

### Render + Railway

1. **Database:** Railway PostgreSQL
2. **Backend API:** Render Node.js
3. **Frontend:** Vercel React

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for complete instructions.

---

## Email Service Setup

### Gmail (Recommended)

1. Go to myaccount.google.com → Security
2. Enable **2-Step Verification**
3. Generate **App Password** for "Mail"
4. Copy 16-character password to SMTP_PASSWORD in .env

### Other Email Providers

Update `backend/services/mail.js` with your SMTP settings.

---

## Next Steps

1. **Local:** Follow dev setup above
2. **Production:** Follow [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
3. **Scale:** Add Stripe for billing, Auth0 for SSO, etc.

---

**Questions?** Check RENDER_DEPLOYMENT.md or contact s.ngandana@pillar5group.co.za
