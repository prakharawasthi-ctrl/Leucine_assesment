# 🧭 User Access Management System

A full-stack role-based access control system built using **Node.js**, **TypeORM**, **PostgreSQL**, and **React.js**. This application enables user registration, login, software access requests, and manager/admin dashboards for approvals and management.

---

## 📌 Table of Contents

- [🚀 Introduction](#-introduction)
- [🧱 Tech Stack](#-tech-stack)
- [🎯 Features](#-features)
- [👤 User Roles](#-user-roles)
- [📡 API Endpoints](#-api-endpoints)
- [🖥 React Pages](#-react-pages)
- [🗃 Database Schema](#-database-schema)
- [⚙ Installation](#-installation)
- [▶ Usage](#-usage)
- [✅ Evaluation Criteria](#-evaluation-criteria)
- [📄 License](#-license)

---

## 🚀 Introduction

This system provides:

- Role-based user access and authentication
- Separate dashboards for Employee, Manager, and Admin
- Request and approval flow for software access
- Admin control for software management
- Secure JWT authentication

---

## 🧱 Tech Stack

### 🔧 Backend
- Node.js
- Express.js
- PostgreSQL
- TypeORM
- JWT
- bcrypt, dotenv

### 🖥 Frontend
- React.js
- React Router
- Axios

---

## 🎯 Features

- 🔐 JWT-based authentication
- 👥 Role-specific dashboards:
  - Employees can request software access
  - Managers can approve or reject requests
  - Admins can manage software
- 🗂 Software access level management
- 💬 Reason-based access request system
- 🎯 Role-based route and UI segregation

---

## 👤 User Roles

| Role     | Capabilities |
|----------|--------------|
| Employee | Register, login, request software access |
| Manager  | Login, view and manage access requests |
| Admin    | Login, create software, view all requests |

---

## 📡 API Endpoints

### 🔐 Authentication
- `POST /api/auth/signup` – Register (default role: Employee)
- `POST /api/auth/login` – Login and receive JWT + user role

### 🛠 Software Management (Admin)
- `POST /api/software` – Create a new software entry

### 📩 Access Requests (Employee)
- `POST /api/requests` – Submit software access request

### ✔ Request Management (Manager)
- `PATCH /api/requests/:id` – Approve/Reject a request

---

## 🖥 React Pages

| Route Path           | Description                         |
|----------------------|-------------------------------------|
| `/register`          | User registration page (Employee)  |
| `/login`             | Login page for all roles           |
| `/employee-dashboard`| Employee dashboard to request software |
| `/manager-dashboard` | Manager dashboard to approve requests |
| `/admin-dashboard`   | Admin dashboard to add/manage software |

---


