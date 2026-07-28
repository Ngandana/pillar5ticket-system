# Deploying to Render + Railway

This guide shows how to deploy your Pillar 5 ticketing system to:
- **Backend:** Render (Node.js Web Service)
- **Database:** Railway PostgreSQL
- **Frontend:** Vercel (React)

---

## Step 1 — Set up Railway PostgreSQL

### 1.1 Create PostgreSQL database

1. Go to [railway.app](https://railway.app)
2. Click **New Project** → select **PostgreSQL**
3. Wait for deployment (takes ~30 seconds)
4. Click the **PostgreSQL** card
5. Click **Connect** tab
6. Copy the connection string (looks like: `postgresql://user:pass@host:port/database`)

### 1.2 Import your schema

**Option A: Using Railway CLI**
1. In Railway dashboard, click **PostgreSQL** → **Connect**
2. Scroll to "Railway CLI" → click
3. You'll get a command like: `railway run psql`
4. Open your `backend/db/schema.sql` in a text editor
5. Copy everything, paste into the Railway psql terminal, hit Enter
6. Tables created ✅

**Option B: Using a GUI tool**
1. Download [DBeaver](https://dbeaver.io) (free)
2. Create new PostgreSQL connection with your Railway details
3. Right-click database → **SQL Editor**
4. Paste your entire `schema.sql` file
5. Execute

### 1.3 Extract individual variables from Railway connection string

From your Railway dashboard, get these 5 values:

```
postgresql://pillar5user:mypassword123@containers-us-west-123.railway.app:5432/railway

DB_HOST     = containers-us-west-123.railway.app
DB_PORT     = 5432
DB_USER     = pillar5user
DB_PASSWORD = mypassword123
DB_NAME     = railway
```

**Write these down** — you'll use them in Render.

---

## Step 2 — Deploy backend to Render

### 2.1 Push code to GitHub

Make sure your entire project (including `backend/` folder) is pushed to GitHub.

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2.2 Connect to Render

1. Go to [render.com](https://render.com)
2. Click **New** → **Web Service**
3. Select your GitHub repo (`pillar5-ticket-system`)
4. Fill in:
   - **Name:** `pillar5-ticket-api`
   - **Root Directory:** `backend` ← important!
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### 2.3 Add environment variables

Still in Render service settings:

1. Scroll to **Environment** section
2. Add each variable:

| Key | Value |
|-----|-------|
| `DB_HOST` | (from Railway step 1.3) |
| `DB_PORT` | `5432` |
| `DB_USER` | (from Railway step 1.3) |
| `DB_PASSWORD` | (from Railway step 1.3) |
| `DB_NAME` | (from Railway step 1.3) |
| `JWT_SECRET` | generate your own long random string — do not reuse any value from this doc |
| `ALLOWED_ORIGIN` | `https://your-vercel-url.vercel.app` (leave as `*` for now) |
| `NODE_ENV` | `production` |
| `DEFAULT_ADMIN_EMAIL` | the email for your first SUPER_ADMIN account |
| `DEFAULT_ADMIN_PASSWORD` | a strong password of your choosing — seeds that account on first boot only |

3. Click **Create Web Service**

Render will now build and deploy. Wait ~2 minutes.

### 2.4 Verify deployment

Once Render shows a green "Live" badge:

1. Copy your Render URL from the dashboard (looks like: `https://pillar5-ticket-api.onrender.com`)
2. Test the health endpoint in your browser:
   ```
   https://pillar5-ticket-api.onrender.com/api/health
   ```
3. You should see:
   ```json
   {"status":"ok","timestamp":"...","uptime":...}
   ```

If you see `ECONNREFUSED` or `ETIMEDOUT` in Render logs:
- Check that DB_HOST, DB_PASSWORD, etc. are exactly correct
- Verify your Railway database is running
- Click **Redeploy** in Render

---

## Step 3 — Deploy frontend to Vercel

### 3.1 Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Select your GitHub repo
4. Vercel will auto-detect it as a Vite project

### 3.2 Add environment variable

In Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://pillar5-ticket-api.onrender.com/api`
   - Click **Add**

3. Click **Deploy**

Wait for build to complete (~3 minutes).

### 3.3 Test the frontend

Vercel will give you a URL like: `https://pillar5-ticket-system.vercel.app`

Open it and:
1. Try to log in with the `DEFAULT_ADMIN_EMAIL` / `DEFAULT_ADMIN_PASSWORD` you set in Render's env vars
2. If login works, your full stack is connected ✅

---

## Step 4 — Update backend ALLOWED_ORIGIN

Now that Vercel has deployed and you have your final URL:

1. Go to Render dashboard → **pillar5-ticket-api** service
2. Click **Environment**
3. Find `ALLOWED_ORIGIN` → click **Edit**
4. Change from `*` to your Vercel URL:
   ```
   https://pillar5-ticket-system.vercel.app
   ```
5. Click **Save** → Render will auto-redeploy

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `ETIMEDOUT` on Render | DB_HOST/password wrong. Verify in Railway dashboard. |
| `password authentication failed` | DB_PASSWORD has special chars? Copy again from Railway. |
| Frontend shows 403 on login | ALLOWED_ORIGIN still set to `*`. Update to your Vercel URL. |
| Blank page on Vercel | Check browser console. VITE_API_URL should point to Render URL. |
| Render keeps crashing | Check logs: `npm audit fix` to fix vulnerabilities, redeploy. |

---

## What you now have

```
🌍 Vercel Frontend
   https://pillar5-ticket-system.vercel.app
        ↓
🔗 CORS from Render Backend
        ↓
🚀 Render API
   https://pillar5-ticket-api.onrender.com
        ↓
💾 Railway PostgreSQL
   containers-us-west-123.railway.app:5432
```

All three services talk to each other across the internet.

---

## Next: Custom domains

To use your own domain (e.g., `api.yourdomain.co.za`):

1. **Render:** Settings → Custom Domains → Add `api.yourdomain.co.za`
2. **Vercel:** Settings → Domains → Add `yourdomain.co.za`
3. Update DNS records with your registrar (Render/Vercel will show instructions)

Done! 🎉
