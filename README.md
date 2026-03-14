# Next.js Dynamic RBAC System

A modern, high-performance **Role-Based Access Control (RBAC)** dashboard built with **Next.js 15 (App Router)**, **Tailwind CSS**, and **Mongoose**. 

This system implements **Atom-based Permissions** with a **Grant Ceiling** architecture, ensuring users can only manage permissions they themselves possess.

---

## 🚀 Key Features

- 🔐 **Atom-Based Permissions**: Granular, single-responsibility permissions (e.g., `read:leads`, `write:users`) instead of static role mapping.
- 🛡️ **Grant Ceiling Rule**: Admin components restrict managers from granting permissions the manager doesn't already hold.
- ⚡ **High-Performance Edge Middleware**: Token verification running on Edge-capable JWT utilities.
- 🔑 **Strict JWT Strategy**:
  - In-memory Access Tokens (Client-side)
  - `httpOnly` Secure Refresh Tokens (Server-side)
- 📊 **Dynamic Dashboard UI**: Components render conditionally based on active permission sets.
- 🎨 **Premium UI/UX Design**: Visuals curated using Tailwind CSS and micro-interactions for smooth layout transitions.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (React 19) |
| **Styling** | Tailwind CSS v4, Lucide Icons |
| **Database** | MongoDB + Mongoose |
| **Auth** | Jose (JWT), BcryptJS |

---

## 📂 Architecture Overview

### Permission Resolution
Active permission atoms are resolved using the formula:
$$\text{Active} = ( \text{Role.basePermissions} \cup \text{User.granted} ) - \text{User.revoked}$$

### Middleware Route Protection
`src/middleware.ts` enforces protected access endpoints by validating permissions dynamically during request resolution, with explicit exclusions for static rendering layouts and media bundles.

---

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js `18.x` or later
- MongoDB (local instance or Atlas connection string)

### 2. Setup `.env.local`
Create a `.env.local` file in the root directory and add your configurations:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secure_secret_at_least_32_characters
```

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Run build compilation or development workflow
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🤝 Contribution Guidelines
To ensure clean management over continuous integrations:
1. Always implement granular authorization gates rather than implicit checks.
2. Direct static assets must bypass middleware using defined edge exception setups.
