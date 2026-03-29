# Jupiter Classes V2 — Full Stack App

Mathematics coaching platform for Class 11 & 12 by Sandeep Sir, Hazaribagh.

## 📁 Project Structure

```
jupiter-v2/
├── backend/        ← Node.js + Express + MongoDB API
└── frontend/       ← React + Tailwind CSS
```

---

## 🚀 Setup & Run

### Step 1 — Backend Setup

```bash
cd backend
npm install
```

**Edit `.env` file — sirf MONGO_URI daalna zaroori hai:**
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/jupiter
```

```bash
npm run dev     # development
npm start       # production
```

Backend runs on: `http://localhost:5000`

**Default Admin Login:**
- Email: `admin@jupiterclasses.com`
- Password: `admin123`

---

### Step 2 — Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

---

## 🔑 Environment Variables

### Backend `.env`
| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ YES | MongoDB connection string |
| `JWT_SECRET` | ✅ YES | Already set |
| `GOOGLE_CLIENT_ID` | ✅ YES | Already set |
| `CLOUDINARY_*` | ✅ YES | Already set |
| `RAZORPAY_KEY_ID` | ⚠️ Optional | For payment feature |
| `RAZORPAY_KEY_SECRET` | ⚠️ Optional | For payment feature |

---

## 🛠️ Tech Stack

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Cloudinary, Razorpay  
**Frontend:** React 18, Tailwind CSS, Framer Motion, React Router v6, Axios
