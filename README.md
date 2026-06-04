# Pillar 5 Group — IT Ticketing System

**Contact:** s.ngandana@pillar5group.co.za

---

## Quick Deployment Summary

- **Frontend:** React 18 + Vite → **Vercel**
- **Backend:** Node.js + Express → **Render**
- **Database:** PostgreSQL → **Railway**

**👉 See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for complete step-by-step deployment guide.**

---

## Local Development (Windows / PowerShell)

### 1. PostgreSQL Database

**Install locally:**
```powershell
# Download from postgresql.org and install
# Then create database:
psql -U postgres -c "CREATE DATABASE pillar5_tickets;"
psql -U postgres -d pillar5_tickets -f backend\db\schema.sql
```

### 2. Backend

```powershell
cd backend
copy .env.example .env
# Edit .env with your PostgreSQL credentials
npm install
npm run dev
```

Runs at: **http://localhost:5000**

### 3. Frontend

```powershell
npm install
npm run dev
```

Runs at: **http://localhost:5173**

---

## Default Login

| Field    | Value                             |
|----------|-----------------------------------|
| Email    | s.ngandana@pillar5group.co.za     |
| Password | Admin@Pillar5!                    |

---

## Environment Variables (backend/.env)

```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=pillar5_tickets

# JWT
JWT_SECRET=change_me_to_something_long

# Server
PORT=5000
ALLOWED_ORIGIN=http://localhost:5173
```

**For Render + Railway**, see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for exact values.

---

## Project Structure

```
pillar5-ticket-system/
├── backend/                    ← Node.js API (Render)
│   ├── db/
│   │   ├── init.js            ← PostgreSQL pool
│   │   └── schema.sql         ← Database schema
│   ├── middleware/
│   ├── routes/
│   ├── server.js
│   ├── fix-admin.js
│   ├── package.json
│   ├── .env.example
│   ├── .nvmrc                 ← Node version for Render
│   └── uploads/               ← Ticket images
│
├── src/                       ← React frontend (Vercel)
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── RENDER_DEPLOYMENT.md       ← 👈 Read this for deployment!
├── README.md                  ← This file
└── package.json
```

---

## Key Files

- **`backend/db/schema.sql`** — PostgreSQL schema (run once on Railway)
- **`backend/fix-admin.js`** — Reset admin password if login fails
- **`RENDER_DEPLOYMENT.md`** — Complete Render/Railway/Vercel deployment guide

---

## Features

- ✅ JWT authentication with session persistence
- ✅ Employee self-service ticket submission (2-step form)
- ✅ Image/screenshot attachment support
- ✅ Real-time employee-admin chat
- ✅ Admin triage queue with filters & sort
- ✅ 5 live KPI dashboard cards
- ✅ Priority escalation & ticket assignment
- ✅ Internal admin notes (hidden from employees)
- ✅ Full audit trail of all changes
- ✅ CSV export of activity logs
- ✅ Soft-delete (withdraw) tickets
- ✅ Dark theme UI

---

## Tech Stack

- **Frontend:** React 18, Vite, TailwindCSS
- **Backend:** Node.js, Express, JWT, Bcrypt
- **Database:** PostgreSQL with native ENUMs
- **File Storage:** Local uploads folder
- **Deployment:** Vercel, Render, Railway

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `psql: command not found` | Install PostgreSQL from postgresql.org |
| `connect ECONNREFUSED` | PostgreSQL not running; start the service |
| `password authentication failed` | Check DB_PASSWORD in .env matches PostgreSQL user |
| 401 on login | Run `node backend/fix-admin.js` |
| Port 5000 already in use | Change `PORT` in .env to `5001` |
| Cannot find `uploads` folder | Create `backend/uploads/` manually |

---

## Next Steps

1. **Local testing:** Follow steps 1-3 above
2. **Production:** Follow [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
3. **Custom domain:** See the "Custom Domains" section in RENDER_DEPLOYMENT.md
4. **Scale:** All three services (Vercel, Render, Railway) auto-scale as needed

---

**Need help?** Check [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) — it has detailed troubleshooting.
