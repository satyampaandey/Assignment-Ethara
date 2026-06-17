# 📦 InvenTrack — Inventory & Order Management System

A full-stack **Inventory & Order Management System** built with React, FastAPI, and PostgreSQL, fully containerized with Docker.

![Tech Stack](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 🚀 Features

### Product Management
- Create, read, update, and delete products
- Track inventory with stock levels and low-stock alerts
- Unique SKU enforcement
- Search and filter products

### Customer Management
- Add and manage customer records
- Unique email enforcement
- Search by name or email

### Order Management
- Create orders with multiple products
- Automatic stock validation and decrement
- Auto-calculated order totals
- Order cancellation with stock restoration

### Dashboard
- Total products, customers, orders overview
- Revenue tracking
- Low stock alerts

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 (Vite) |
| Backend | Python 3.11 + FastAPI |
| Database | PostgreSQL 15 |
| Containerization | Docker + Docker Compose |
| Styling | Custom CSS (Dark Theme) |

---

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed
- [Git](https://git-scm.com/) installed

---

## 🏃 Quick Start (Docker)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/inventory-system.git
cd inventory-system
```

### 2. Start all services

```bash
docker-compose up --build -d
```

### 3. Access the application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |

### 4. Stop services

```bash
docker-compose down
```

To remove volumes (database data):
```bash
docker-compose down -v
```

---

## 🧪 Local Development (Without Docker)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt

# Set environment variable
set DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/inventory_db

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/products/` | Create a product |
| GET | `/products/` | List all products |
| GET | `/products/{id}` | Get product by ID |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/customers/` | Create a customer |
| GET | `/customers/` | List all customers |
| GET | `/customers/{id}` | Get customer by ID |
| DELETE | `/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders/` | Create an order |
| GET | `/orders/` | List all orders |
| GET | `/orders/{id}` | Get order by ID |
| DELETE | `/orders/{id}` | Cancel/delete order |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/` | Get summary stats |

---

## 🐳 Docker Hub

### Push backend image to Docker Hub

```bash
docker build -t YOUR_DOCKERHUB_USERNAME/inventory-backend:latest ./backend
docker push YOUR_DOCKERHUB_USERNAME/inventory-backend:latest
```

---

## 🌐 Deployment Guide

### Backend Deployment (Render)

1. Create a **New Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Set the following:
   - **Root Directory**: `backend`
   - **Runtime**: Docker
   - **Environment Variables**:
     - `DATABASE_URL` = Your PostgreSQL connection string (use Render PostgreSQL or ElephantSQL)
4. Deploy

### Frontend Deployment (Vercel)

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Deploy:
   ```bash
   vercel --prod
   ```
4. Set environment variable in Vercel dashboard:
   - `VITE_API_URL` = Your deployed backend URL

### Frontend Deployment (Netlify)

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `dist` folder to [Netlify](https://netlify.com)
3. Add a `_redirects` file to `public/`:
   ```
   /*    /index.html   200
   ```
4. Set environment variable:
   - `VITE_API_URL` = Your deployed backend URL

---

## 📁 Project Structure

```
inventory-system/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI app
│   │   ├── config.py          # Settings
│   │   ├── database.py        # DB connection
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── crud.py            # Business logic
│   │   └── routers/
│   │       ├── products.py
│   │       ├── customers.py
│   │       ├── orders.py
│   │       └── dashboard.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── api/api.js
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductForm.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── CustomerForm.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── OrderForm.jsx
│   │   │   └── OrderDetail.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
├── docker-compose.yml
├── .env
├── .gitignore
└── README.md
```

---

## 📄 License

MIT License
