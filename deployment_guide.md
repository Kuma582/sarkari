# 🚀 Deployment Guide (How to make it Public)

Follow these steps carefully to put your website online.

---

## Step 1: Set up MongoDB Atlas (Cloud Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. Create a new **Project** and then a **Cluster** (choose the "M0" Free tier).
3. Under **Network Access**, click "Add IP Address" and select **"Allow Access from Anywhere"** (0.0.0.0/0).
4. Under **Database Access**, create a user with a password (remember it!).
5. Click **"Connect"** -> **"Drivers"** -> Copy the connection string (SRV).
   - It will look like: `mongodb+srv://user:password@cluster.mongodb.net/sarkari?retryWrites=true&w=majority`
   - Replace `<password>` with your actual password.

---

## Step 2: Push Code to GitHub
1. Create a new repository on [GitHub](https://github.com).
2. Upload your entire project folder (`sarkri/`) to this repository.

---

## Step 3: Deploy Backend on Render.com
1. Go to [Render](https://render.com) and sign up.
2. Click **"New"** -> **"Web Service"**.
3. Connect your GitHub repository.
4. Settings:
   - **Name**: `sarkri-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Go to **"Environment"** and add:
   - `MONGODB_URI`: (Your Atlas connection string)
   - `JWT_SECRET`: (Any random long string)
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
6. Copy the backend URL (e.g., `https://sarkri-backend.onrender.com`).

---

## Step 4: Update Frontend API URL
1. Open `js/main.js` and `admin/js/admin.js` on your computer.
2. Replace `https://sarkri-backend.onrender.com/api` with your **actual Render URL** followed by `/api`.
3. Save and push the changes to GitHub.

---

## Step 5: Deploy Frontend on Netlify
1. Go to [Netlify](https://app.netlify.com).
2. Click **"Add new site"** -> **"Import from GitHub"**.
3. Select your repository.
4. **Base directory**: (Leave blank)
5. **Build command**: (Leave blank)
6. **Publish directory**: `.` (The root folder)
7. Click **"Deploy"**.
8. Copy your Netlify URL (e.g., `https://your-site.netlify.app`).

---

## Step 6: Final CORS Configuration
1. Go back to `backend/server.js`.
2. Find the `allowedOrigins` array.
3. Add your Netlify URL there.
4. Save and push to GitHub. Render will automatically redeploy.

---

**🎉 Your site should now be live!**
