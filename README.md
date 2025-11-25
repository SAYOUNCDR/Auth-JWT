<div align="center">

# 🔐 JWT Authentication System

### Full-stack authentication with JWT tokens, refresh tokens, and protected routes

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

</div>

---

## 🛠️ Tech Stack

### Backend

- 🟢 **Node.js** + Express
- 🍃 **MongoDB** + Mongoose
- 🔑 **JWT** for authentication
- 🔒 **bcrypt** for password hashing
- ✅ **Zod** for validation
- 🛡️ **Rate limiting** for security

### Frontend

- ⚛️ **React 19** + Vite
- 🧭 **React Router** v7
- 📡 **Axios** for API calls
- 🎯 **Context API** for state management
- 🎨 **Tailwind CSS**

## Features

- User registration with validation
- Secure login with JWT access tokens
- Refresh token mechanism using HTTP-only cookies
- Protected routes
- Rate limiting on sensitive endpoints
- CORS configuration
- Token-based authentication

## Project Structure

```
Auth/
├── BackendAuth/          # Express backend
│   ├── index.js          # Main server file
│   ├── Users.js          # User model
│   └── .env              # Environment variables
└── FrontendAuth/         # React frontend
    ├── src/
    │   ├── components/   # React components
    │   ├── api/          # Axios configuration
    │   └── AuthContext.jsx
    └── vite.config.js
```

## Setup

### Backend

```bash
cd BackendAuth
npm install
```

Create `.env` file:

```env
SECRET_KEY=your_secret_key
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
```

Start MongoDB:

```bash
mongod
```

Run server:

```bash
npm run dev
```

Server runs on `http://localhost:4000`

### Frontend

```bash
cd FrontendAuth
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints

### Authentication

**POST** `/users` - Register new user

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**POST** `/login` - Login user

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**POST** `/auth/refresh` - Refresh access token

**POST** `/logout` - Logout user

### Protected Routes

**GET** `/users-me` - Get current user (requires Bearer token)

## Authentication Flow

1. User registers with email and password
2. Password is hashed using bcrypt before storage
3. On login, server issues:
   - Access token (15 min expiry) sent in response
   - Refresh token (7 days) stored in HTTP-only cookie
4. Frontend stores access token and includes it in requests
5. When access token expires, refresh token generates new access token
6. Protected routes verify access token before granting access

## Security Features

- Password hashing with bcrypt (salt rounds: 10)
- HTTP-only cookies for refresh tokens
- Rate limiting (5 requests/min on login and refresh)
- CORS configuration for cross-origin requests
- Token scope validation (access vs refresh)
- Zod schema validation for inputs

## Environment Variables

| Variable            | Description          | Default  |
| ------------------- | -------------------- | -------- |
| `SECRET_KEY`        | JWT signing secret   | Required |
| `ACCESS_TOKEN_TTL`  | Access token expiry  | 15m      |
| `REFRESH_TOKEN_TTL` | Refresh token expiry | 7d       |

## Development

Backend with auto-reload:

```bash
npm run dev
```

Frontend with hot reload:

```bash
npm run dev
```
