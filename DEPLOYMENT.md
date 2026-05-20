# SatikFlow CRM - Production Deployment Guide

This guide details the step-by-step instructions required to deploy the **SatikFlow CRM** system to production hosting platforms.

---

## 1. Prerequisites & Stack Overview
*   **Database**: MongoDB Atlas (Cloud Database)
*   **Backend API**: Node.js/Express deployed to Render (or Heroku)
*   **Frontend client**: React/Vite deployed to Vercel (or Netlify)

---

## 2. Database Setup: MongoDB Atlas
1.  Sign in or register at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a new Database Cluster (Shared free tier is sufficient).
3.  Navigate to **Database Access** and create a database user with read/write privileges (note the password).
4.  Navigate to **Network Access** and select **Add IP Address**. Choose **Allow Access from Anywhere** (`0.0.0.0/0`) or whitelist Render's static outbound IPs.
5.  Select **Database**, click **Connect**, choose **Connect your application**, and copy the Connection String.
    *   *Example Connection String*: `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/satikflow-crm?retryWrites=true&w=majority`

---

## 3. Backend Deployment: Render
1.  Create an account at [Render](https://render.com).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository containing the SatikFlow CRM project.
4.  Configure the service details:
    *   **Name**: `satikflow-backend`
    *   **Root Directory**: `backend`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install && npm run build`
    *   **Start Command**: `node dist/index.js`
5.  Scroll to **Advanced** and click **Add Environment Variable**. Configure these production variables:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enforces production-optimized builds and restricts local-only features |
| `PORT` | `10000` (assigned automatically) | Render defaults to port 10000 |
| `MONGO_URI` | `mongodb+srv://.../satikflow-crm` | Connection string obtained from MongoDB Atlas |
| `JWT_SECRET` | `your_custom_long_production_random_jwt_secret` | Secure signing key for user authentication tokens |
| `CLIENT_URL` | `https://satikflow-crm.vercel.app` | Production URL of the Vercel frontend |

6.  Deploy the web service and copy the generated live backend URL (e.g. `https://satikflow-backend.onrender.com`).

---

## 4. Frontend Deployment: Vercel
1.  Create an account or login to [Vercel](https://vercel.com).
2.  Click **Add New** and choose **Project**.
3.  Select your GitHub repository.
4.  In the Project Configuration panel:
    *   **Framework Preset**: `Vite`
    *   **Root Directory**: `frontend`
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
5.  Open the **Environment Variables** section and define:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://satikflow-backend.onrender.com/api` | The live URL of the Render backend + `/api` |

6.  Click **Deploy**. Once successfully deployed, copy the live frontend URL and update the `CLIENT_URL` variable in your Render backend settings.

---

## 5. Seed Data Setup
To populate the production database with initial lead pools, custom fields, calling agent accounts, and manager setups, execute the seeding task from a local terminal targetting your production database.

```bash
# From the root directory:
cd backend

# Temporarily override MONGO_URI to target production:
MONGO_URI="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/satikflow-crm" npm run seed
```

Once executed, you will be able to log in to the production CRM dashboard using the primary accounts:
*   **Manager**: `manager@satikflow.com` / `Password@123`
*   **Agent 1**: `agent1@satikflow.com` / `Password@123`
*   **Agent 2**: `agent2@satikflow.com` / `Password@123`

---

## 6. Apple Numbers (.numbers) File Ingestion Note
*   **Development**: In local environments, Apple Numbers (`.numbers`) files are parsed automatically using a background Python bridge running `numbers-parser`.
*   **Production**: Installing custom Python headers and dependencies within standard Node.js hosting environments adds configuration risk, slow builds, and vulnerability issues. Therefore, **`.numbers` file uploads are disabled in production mode**.
*   **Production Workaround**: When uploading lists on the production platform, managers are prompted via a clean UI message to export their spreadsheets from Numbers as standard **CSV** or **Excel (XLSX)** files before importing.
