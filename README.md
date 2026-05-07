# Master Photostate & Telecom — Daily Cash Tracker

A full MERN stack app to record Day/Night shift denominations, deductions, and print 4×6 reports.

---

## Project Structure

```
shop-app/
├── index.html
├── package.json          ← React (frontend)
├── vite.config.js
├── src/
│   ├── main.jsx
│   └── App.jsx           ← All UI code (single file)
└── server/
    ├── server.js         ← Express entry point
    ├── package.json      ← Node (backend)
    ├── .env.example
    ├── models/
    │   └── Report.js     ← Mongoose schema
    └── routes/
        └── reports.js    ← REST API routes
```

---

## Quick Start

### 1. Frontend (React)

```bash
# From the shop-app/ root folder:
npm install
npm run dev
```
Opens at http://localhost:5173

> **Note:** The app works standalone using localStorage without any backend. Connect the backend for persistent cloud storage.

---

### 2. Backend (Express + MongoDB)

```bash
# Install MongoDB Community Edition first:
# https://www.mongodb.com/try/download/community

# Then from the server/ folder:
cd server
npm install

# Copy .env.example to .env
cp .env.example .env

# Start server (with auto-reload)
npm run dev
```
Runs at http://localhost:5000

---

## Connecting Frontend to Backend

In `src/App.jsx`, replace the `localStorage` save/load calls with `fetch()` to your API:

```js
// Save report
await fetch('http://localhost:5000/api/reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(report),
});

// Load all reports
const res = await fetch('http://localhost:5000/api/reports');
const data = await res.json();
setReports(data);
```

---

## API Endpoints

| Method | Endpoint            | Description               |
|--------|---------------------|---------------------------|
| GET    | /api/reports        | List all reports           |
| GET    | /api/reports/:id    | Get one full report        |
| POST   | /api/reports        | Create/replace day report  |
| DELETE | /api/reports/:id    | Delete a report            |

---

## Print

Click the **Print** button. Your browser will print using:
```css
@page { size: 4in 6in; margin: 5mm; }
```
Set your printer paper size to **4×6 inches** (postcard/receipt size).

---

## Denominations Supported

৳1000, ৳500, ৳200, ৳100, ৳50, ৳20, ৳10, ৳5, ৳2, ৳1

## Deductions

- ইন্টারনেট (Internet)
- স্টেশনারি (Stationery)
- বাসা বাজার (House/Market)
- অতিরিক্ত / Extra (added to total, not deducted)
