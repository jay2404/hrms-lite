# HRMS Lite — Human Resource Management System

A clean, production-ready full-stack HRMS application built with React, Node.js/Express, and PostgreSQL.

## 🚀 Live Demo

- **Frontend:** https://hrms-lite-hazel-eta.vercel.app/
- **Backend API:** https://hrms-lite-omzn-production.up.railway.app

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Lucide Icons, React Hot Toast, Axios |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Validation | express-validator |
| Deployment | Vercel (Frontend), Railway (Backend + Database) |

---

## ✨ Features

### Employee Management
- Add employees with ID, Full Name, Email, Department
- View all employees with search/filter
- Delete employees (cascades attendance records)
- Duplicate validation (ID & Email)

### Attendance Management
- Mark daily attendance (Present / Absent)
- Upsert logic — updating if record exists for same employee+date
- Filter attendance by employee and/or date
- Delete individual attendance records

### Dashboard
- Summary stats: total employees, departments, present today, total present days
- Attendance summary table per employee

### Bonus Features ✅
- Filter attendance records by date
- Display total present days per employee
- Basic dashboard summary (counts + table)

---

## 📦 Running Locally

### Prerequisites
- Node.js v18+
- PostgreSQL database

### 1. Clone the repository

```bash
git clone https://github.com/jay2404/hrms-lite.git
cd hrms-lite
```

### 2. Setup Backend

```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection string
```

**.env:**
```
DATABASE_URL=postgresql://username:password@localhost:5432/hrms_db
PORT=5000
NODE_ENV=development
```

```bash
# Start backend (tables auto-created on first run)
npm start
# or for development with hot reload:
npm run dev
```

The API will run on `http://localhost:5000`

### 3. Setup Frontend

```bash
cd ../frontend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env to point to your backend
```

**.env:**
```
REACT_APP_API_URL=http://localhost:5000/api
```

```bash
npm start
```

The app will open at `http://localhost:3000`

---

## 🌐 Deployment Guide

### Backend → Railway

1. Push code to GitHub
2. Go to [Railway](https://railway.app) and create a new project
3. Click **"Deploy from GitHub repo"** and select your repo
4. Set Root Directory to `backend`
5. Set Start Command to `node server.js`
6. Add environment variables:
   - `DATABASE_URL` — your PostgreSQL connection string
   - `NODE_ENV=production`
7. Go to **Settings → Networking** and click **"Generate Domain"**

### Database → Railway PostgreSQL / Supabase

1. Create a PostgreSQL database on [Railway](https://railway.app) or [Supabase](https://supabase.com)
2. Copy the connection string
3. Add it as `DATABASE_URL` in your backend service environment variables

### Frontend → Vercel

1. Go to [Vercel](https://vercel.com) and import your GitHub repo
2. Set Root Directory to `frontend`
3. Add environment variable:
   - `REACT_APP_API_URL=https://hrms-lite-omzn-production.up.railway.app/api`
4. Click Deploy

---

## 📡 API Endpoints

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List all employees |
| GET | `/api/employees/:id` | Get single employee |
| POST | `/api/employees` | Create employee |
| DELETE | `/api/employees/:id` | Delete employee |
| GET | `/api/employees/stats/summary` | Dashboard stats |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | List records (with filters) |
| GET | `/api/attendance/stats` | Per-employee attendance stats |
| POST | `/api/attendance` | Mark/update attendance |
| DELETE | `/api/attendance/:id` | Delete record |

---

## 🗃 Database Schema

```sql
-- Employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Attendance table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(10) NOT NULL CHECK (status IN ('Present', 'Absent')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, date)
);
```

---

## ⚠️ Assumptions & Limitations

- Single admin user — no authentication required
- Leave management, payroll, and advanced features are out of scope
- Attendance upsert: marking attendance twice for the same employee+date updates the existing record
- Employee deletion cascades to all their attendance records

---

## 📁 Project Structure

```
hrms-lite/
├── backend/
│   ├── routes/
│   │   ├── employees.js
│   │   └── attendance.js
│   ├── db.js           # PostgreSQL connection + schema init
│   ├── server.js       # Express server
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   └── Sidebar.js
    │   ├── pages/
    │   │   ├── Dashboard.js
    │   │   ├── Employees.js
    │   │   └── Attendance.js
    │   ├── api.js
    │   ├── App.js
    │   └── index.css
    ├── .env.example
    └── package.json
```
