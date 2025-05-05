# 🌐 Halo Harbor

Halo Harbor is a **privacy-preserving, modular federated learning framework** that enables **service providers** to collaborate securely with user-contributed data while ensuring **data sovereignty, transparency**, and **regulatory compliance**.

## 🔍 Overview

Traditional data sharing practices often compromise user privacy. Halo Harbor is designed with a **user-first** philosophy — it ensures **fine-grained access control**, **data minimization**, and **federated computation**, so **raw data never leaves the user’s control**.

This platform is built with:
- A **User Portal** for connecting services like Reddit, Spotify, and Strava and managing data access.
- A **Service Provider Portal** to create invitations, collect data (if consented), and train models securely.

---

## 🧩 Features

### ✅ User Portal
- OAuth login with Reddit, Spotify, Strava
- Data Plug section for connecting data sources
- Access Control for managing permissions
- View insights and shared data history

### 🛠 Service Provider Portal
- Dashboard for participant & data stats
- Create and manage invitations
- Initiate data acquisition
- Launch federated training jobs
- View collected data and logs

---

## 📂 Project Structure

HaloHarbor/
│
├── user-frontend/ # React frontend for user-side
├── service-provider/ # React frontend for provider-side
├── backend-oauth/ # Backend for OAuth and API routes (Node.js/Express)
├── shared-data-service/ # MongoDB + federated computation handler (Vert.x)
├── docker-compose.yml # Service orchestration
├── docs/ # Functional documentation, flowcharts, diagrams
└── README.md


---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB
- Docker & Docker Compose
- Git

### 🔧 Setup

```bash

docker-compose up --build
```

### The following services will start:

- frontend-user on localhost:3000
- frontend-provider on localhost:3001
- backend-oauth on localhost:9080
- shared-data-service on localhost:9081
- MongoDB on localhost:27017



