# FitTrack

FitTrack is a full-stack workout tracking application that allows users to create workouts and log exercises with sets, reps, and weight.

---

## Features

- User authentication (Signup / Login / Logout)
- Protected dashboard (JWT-based auth)
- Create and delete workouts
- Add exercises to workouts
- Delete exercises
- Persistent user-specific data
- Loading state + improved UX messaging

---

## Tech Stack

### Frontend
- React
- Vite
- React Router

### Backend
- Flask
- SQLAlchemy
- Flask-JWT-Extended
- Flask-Bcrypt
- Flask-CORS

### Database
- SQLite (development and deployed)

---

## Authentication

- JWT tokens are issued on login/signup
- Tokens are stored in `localStorage`
- Protected routes require valid JWT
- Users can only access their own workouts and exercises

---

## API Endpoints

### Auth
- `POST /api/signup`
- `POST /api/login`

### Workouts
- `GET /api/workouts`
- `POST /api/workouts`
- `DELETE /api/workouts/:id`

### Exercises
- `POST /api/workouts/:id/exercises`
- `DELETE /api/exercises/:id`

---

## Setup Instructions

Note: In production, the backend is deployed on Render and frontend on Netlify.

### 1. Clone repo
```bash
git clone https://github.com/bora682/fittrack.git
cd fittrack
```

### 2. Backend setup
```bash
cd server
pipenv install
pipenv shell
flask db upgrade
python app.py
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

## Deployment
Frontend deployed with Netlify. Backend deployed with Render.

Live App: https://fittrack-dashboard.netlify.app

Backend API: https://fittrack-backend-lx5h.onrender.com

## Future Improvements
- Edit workouts
- Edit exercises
- Better UI styling
- Pagination
- Mobile responsiveness

## Author
Bora