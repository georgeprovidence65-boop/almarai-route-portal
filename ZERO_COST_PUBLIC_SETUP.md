# Zero-Cost Public Setup

This project currently works on your laptop. A laptop link such as `http://172.25.88.25:5000` only works for people on the same Wi-Fi.

For customers, salesmen, admins, and managers in different places, the QR must point to a public HTTPS link, for example:

```text
https://your-free-app.onrender.com/portal-login
```

## Recommended Free Beginner Setup

Use:

- **Render Free Web Service** for the Node/Express app.
- **Supabase Free** for PostgreSQL.

Do not use Render Free Postgres for this if you need it longer than testing, because Render's free Postgres is currently marked as a 30-day free tier on their pricing page.

This is the recommended setup for this project:

```text
Render Free Web Service + Supabase Free PostgreSQL
```

Why this choice:

- Render gives you the public HTTPS app link for QR scanning.
- Supabase gives you a free PostgreSQL database suitable for starting small.
- Customers and salesmen can open the same QR from different areas.
- You do not need to keep the laptop running.
- You avoid paying monthly while testing and starting small.

## Why This Fits The Goal

- Customers do not install anything.
- Salesmen do not need to be on your Wi-Fi.
- Staff scan one QR and login.
- Login role decides the portal:
  - `manager` -> `/manager-portal`
  - `admin` -> `/admin-dashboard`
  - `salesman` -> `/salesman-dashboard`
  - `customer` -> `/customer-page`
- The app can stay free while usage is small, but free services have limits and can sleep or pause.

## Step 1 - Create Free PostgreSQL

Create a free PostgreSQL project on Supabase or Neon.

Copy these values:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
DB_SSL=true
```

## Step 2 - Deploy The Backend

Create a free web service for this folder:

```text
C:\Users\Huawei\almarai\backend
```

Use:

```text
Build command: npm install
Start command: npm.cmd start
```

If the host expects Linux commands, use:

```text
Start command: npm start
```

Add environment variables from `.env.example`.

This project includes `render.yaml`, so Render can detect:

```text
Build command: npm install
Start command: npm start
Plan: free
```

## Step 3 - Prepare Database Tables

After deployment, run the setup command once:

```text
npm run setup
```

If the hosting dashboard has a shell, run it there. If not, run setup locally after pointing your local `.env` to the public database.

## Step 3B - Create The First Manager Login

After the public database is ready, create the first manager login. Do not hard-code passwords inside files.

Set these environment variables:

```text
USER_FULL_NAME=George Kalyesubula
USER_PHONE=0542243596
USER_PASSWORD=your-private-password
USER_ROLE=manager
```

Then run:

```text
npm run create-user
```

You can use the same command later to create:

```text
USER_ROLE=admin
USER_ROLE=salesman
USER_ROLE=customer
```

## Step 4 - Create The Public Company QR

When your app has a public URL, open:

```text
https://your-free-app-url/qr?data=https%3A%2F%2Fyour-free-app-url%2Fportal-login&title=Almarai%20Company%20Portal
```

That QR is the one to print and place at the depot.

## Step 5 - Test Correctly

Test from your phone using mobile data, not the same Wi-Fi.

Open:

```text
https://your-free-app-url/portal-login
```

Login with a manager/salesman/customer account and confirm it opens the correct portal.

## Important Limits

Free hosting is good for starting and testing with real users, but it is not the same as paid production hosting.

Common free limits:

- App may sleep after inactivity.
- Database storage is limited.
- Bandwidth is limited.
- No guaranteed uptime.
- If usage grows, you may eventually need a paid plan.

## External Hard Drive Backup

To export a backup:

```text
npm run backup
```

By default, backups are saved inside:

```text
backend/backups
```

To save directly to an external drive, set:

```text
BACKUP_DIR=E:\AlmaraiBackups
```

Then run:

```text
npm run backup
```

Each backup folder contains JSON files for customers, products, users, stock, visits, transfers, orders, and requests.
