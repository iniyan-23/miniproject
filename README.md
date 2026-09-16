# ShopSphere MERN E-Commerce

A full-stack e-commerce application built with MongoDB, Express, React, and Node.js.

## Requirements

- Node.js 18+
- MongoDB running locally on port 27017

## Setup

### Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run data:seed
npm start
```

The API runs at `http://localhost:5000`.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The Vite development server runs at the URL shown in the terminal, usually `http://localhost:5173`.

## Validation

```powershell
cd frontend
npm run lint
npm run build
```
