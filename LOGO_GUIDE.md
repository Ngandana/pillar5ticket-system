# 🎨 Logo Update Guide

This guide shows you how to replace the default "P5" logo with your custom company logo.

---

## Step 1: Prepare Your Logo File

**Requirements:**
- **Format:** PNG or JPG (recommend PNG for transparency)
- **Size:** 200x200 pixels minimum (square is best)
- **Location:** Place in your project at `public/logo.png`

**Recommended sizes:**
- Small: 48x48 px (navbar display)
- Medium: 100x100 px (login page)
- Large: 200x200 px (original for scaling)

**Example naming:**
```
public/
└── logo.png          ← Your company logo here
```

---

## Step 2: Update the Login Page (AuthPage.jsx)

Open `src/pages/AuthPage.jsx` and find this section:

```jsx
<div className="auth-logo-wrap">
  <div className="auth-logo">P5</div>
  <h1 className="auth-heading">Pillar 5 Group</h1>
  <p className="auth-tagline">IT Support Portal</p>
</div>
```

Replace it with:

```jsx
<div className="auth-logo-wrap">
  <img src="/logo.png" alt="Company Logo" className="auth-logo-img" />
  <h1 className="auth-heading">Pillar 5 Group</h1>
  <p className="auth-tagline">IT Support Portal</p>
</div>
```

---

## Step 3: Update CSS for Logo Image

Open `src/index.css` and find the `.auth-logo` section:

```css
.auth-logo {
  width: 60px;
  height: 60px;
  background: var(--accent);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  margin-bottom: 16px;
}
```

**Add** this new class below it:

```css
.auth-logo-img {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
  border-radius: 12px;
  object-fit: contain;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
```

---

## Step 4: Update Navbar Logo (Optional)

If you want your logo in the top navbar too:

Open `src/components/shared/Navbar.jsx` and find the navbar section that currently has "P5".

Replace:
```jsx
<div className="navbar-logo">P5</div>
```

With:
```jsx
<img src="/logo.png" alt="Logo" className="navbar-logo-img" />
```

Add this CSS to `src/index.css`:
```css
.navbar-logo-img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: contain;
}
```

---

## Step 5: Test Locally

1. **Save all files**
2. **Restart your dev server:**
   ```bash
   npm run dev
   ```
3. **Visit login page:** `http://localhost:5173`
4. **Verify logo appears** correctly sized and positioned

---

## Common Issues

**Logo not showing?**
- [ ] Check file path: `public/logo.png`
- [ ] Check file exists: Look in project root `/public/` folder
- [ ] Check file format: Should be `.png` or `.jpg`
- [ ] Clear browser cache: Press `Ctrl+Shift+Delete`
- [ ] Restart dev server: Stop and run `npm run dev`

**Logo looks stretched/squashed?**
- [ ] Change `object-fit: contain` to `object-fit: cover` in CSS
- [ ] Ensure logo file is square (or resize in image editor)

**Logo too big/small?**
- [ ] Adjust `width` and `height` in `.auth-logo-img` CSS
- [ ] Recommended: 80px for login page, 40px for navbar

---

## Production Deployment

When deploying to Vercel:

1. **Ensure `public/logo.png` exists** locally
2. **Commit to GitHub:**
   ```bash
   git add public/logo.png
   git commit -m "Add company logo"
   git push origin main
   ```
3. **Vercel auto-deploys** from GitHub
4. **Logo available at:** `https://your-domain.com/logo.png`

---

## Revert to Default Logo

If you want to go back to the "P5" text logo, simply:

1. **In `src/pages/AuthPage.jsx`**, change back to:
   ```jsx
   <div className="auth-logo">P5</div>
   ```

2. **Remove** the `.auth-logo-img` CSS class if added

---

## Advanced: Dynamic Logo from URL

If your logo is hosted elsewhere (e.g., company CDN):

```jsx
<img 
  src={process.env.REACT_APP_LOGO_URL || '/logo.png'} 
  alt="Logo" 
  className="auth-logo-img" 
/>
```

Then set in `.env`:
```env
REACT_APP_LOGO_URL=https://your-cdn.com/logo.png
```

---

## File Checklist

After updating:

- [ ] Logo file added to `public/logo.png`
- [ ] `AuthPage.jsx` updated with `<img>` tag
- [ ] CSS updated with `.auth-logo-img` class
- [ ] Dev server restarted
- [ ] Logo appears on login page
- [ ] Logo appears correctly sized
- [ ] Changes pushed to GitHub (if using GitHub)

---

**Done!** Your custom logo now appears throughout the app. 🎉

