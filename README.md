# CuteLookComfy

> A high-performance, full-stack boutique e-commerce engine designed for seamless shopping and administration. Featuring a Java Spring Boot REST API, a reactive web frontend, PostgreSQL, and Redis cache wrapped in a clean, multi-container Docker configuration.

---

## Technical Overview & Stack

CuteLookComfy is built with a decoupled architecture focusing on strict type safety, data integrity, secure session management, and low latency.

```
                  ┌───────────────────────┐
                  │   React Web Client    │
                  │   & Admin Dashboard   │
                  └───────────┬───────────┘
                              │ HTTPS / JSON
                              ▼
                  ┌───────────────────────┐
                  │    Spring Boot API    │
                  │       (Port 8080)     │
                  └──────┬─────────┬──────┘
                         │         │
            JPA / SQL    │         │  Redis Protocol
            (Port 5432)  ▼         ▼  (Port 6379)
             ┌──────────────┐   ┌──────────────┐
             │  PostgreSQL  │   │ Redis Cache  │
             │   Database   │   │  & Rate Lmtr │
             └──────────────┘   └──────────────┘
```

### Backend (Core API)
*   **Framework & Runtime**: Java 21, Spring Boot 3.2.5, Maven.
*   **Security & Auth**: Spring Security 6, JWT (Json Web Tokens via `jjwt`), OAuth2 Client (for Google Login integration).
*   **Database & Migrations**: Spring Data JPA (Hibernate), Flyway for version-controlled, production-safe SQL schema migrations.
*   **Caching & Optimization**: Spring Data Redis for user sessions, API response caching, and product catalog acceleration.
*   **Rate Limiting**: API protection via `Bucket4j` with Redis backend storage (distributed token-bucket algorithm).
*   **Integrations**:
    *   **Payments**: Razorpay SDK for secure checkout flows and webhooks.
    *   **Storage**: AWS S3 SDK for CDN-optimized product and review image uploads.
    *   **Mailers**: Spring Starter Mail with Thymeleaf template rendering for beautiful transactional emails.
    *   **Invoicing**: iText 7 for generating print-ready PDF tax invoices dynamically.

### Frontend (Client App)
*   **Framework & Tools**: React 18, React Router v6, Vite / React Scripts.
*   **State Management**: `Zustand` for ultra-lightweight client-side cart and theme state management.
*   **Server Cache**: `@tanstack/react-query` (React-Query) for declarative, auto-refreshed backend data synchronization.
*   **Animations**: `Framer Motion` for smooth transitions, cart drawer slides, and hover interactions.
*   **Styling**: Pure vanilla CSS styled dynamically with a highly refined dark/light design system.

---

## Directory Structure

```
CuteLookComfy/
├── backend/                  # Java Maven project
│   ├── Dockerfile
│   ├── pom.xml               # Spring Boot starter dependencies
│   └── src/                  # Main Spring app codebase
├── frontend/                 # React client application
│   ├── Dockerfile
│   ├── nginx.conf            # Custom routing configuration for production builds
│   ├── package.json          # Frontend dependencies
│   └── src/                  # React source components & hooks
├── docker-compose.yml        # Orchestration configurations for dev & staging
└── README.md                 # System documentation
```

---

## Database Migrations (Flyway Schema)

The database schema is constructed sequentially via Flyway migrations under `backend/src/main/resources/db/migration`. This ensures consistent schema state across local environments and production pipelines:

1.  `V1` - `V5`: Core entity setup (Users, Categories, Products, Product Images, and Product Variants).
2.  `V6` - `V9`: Order infrastructure (Shipping Addresses, Coupons, Orders, and Order Items).
3.  `V10` - `V12`: Customer interaction layers (Payments, Reviews, and Review Images).
4.  `V13` - `V18`: Operational integrations (Wishlists, Return Requests, Notifications, Newsletter Subscriptions, Coupon Usage, and Order Status History).
5.  `V19` - `V20`: Dynamic Site Settings initialization and seeding default application configurations.
6.  `V21` - `V22`: Performance tuning (b-tree indexes on foreign keys and frequently searched text columns) and migration adding standard user password fields.

---

## Getting Started

### Prerequisites
You need the following installed locally:
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes docker-compose)
*   *Alternatively, if running without Docker:* Java 21 JDK, Maven 3.9+, Node.js v18+, PostgreSQL 16+, Redis 7+.

### Quickstart (Docker Compose)

1.  **Clone this repository and navigate to the folder:**
    ```bash
    git clone https://github.com/Nandini-Chourasiya/CuteLookComfy.git
    cd CuteLookComfy
    ```

2.  **Set up environment variables:**
    Create a `.env` file at the root of the project with your local database configuration and authentication credentials.

3.  **Boot the entire stack:**
    ```bash
    docker compose up --build -d
    ```
    Docker will spin up four services:
    *   `postgres`: Accessible locally on port `5432`.
    *   `redis`: Accessible locally on port `6379`.
    *   `backend`: Spring Boot REST API accessible on `http://localhost:8080`.
    *   `frontend`: React frontend client running on `http://localhost:3000`.

---

## Local Development (Without Docker)

If you prefer building and running the frontend and backend independently outside of Docker container runtimes:

### 1. Database & Cache
Make sure local instances of **PostgreSQL** (with a database named `ecommerce`) and **Redis** are active.

### 2. Backend Spring Boot Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Import Maven dependencies:
    ```bash
    mvn clean install
    ```
3.  Launch the Spring application:
    ```bash
    mvn spring-boot:run
    ```
    *The API will start on port `8080`. Flyway will auto-run all unapplied migrations on startup.*

### 3. Frontend React Setup
1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm start
    ```
    *The web application will open on `http://localhost:3000` with hot-reloading active.*

---

## API Documentation Quick Reference

All endpoints expect and return JSON. Admin routes require a JWT token carrying `ROLE_ADMIN` permissions in the `Authorization: Bearer <token>` header.

### Authentication (`/api/auth/*`)
*   `POST /api/auth/register` - Create a new user account.
*   `POST /api/auth/login` - Authenticate user credentials, returns JWT token + user profile.
*   `POST /api/auth/refresh` - Swap an expiring token for a fresh session key.

### Products (`/api/products/*`)
*   `GET /api/products` - Pageable query of active products (filters for categories, keywords, sort keys).
*   `GET /api/products/{slug}` - Retrieve detailed specifications and variants of a single product.

### Cart & Orders (`/api/cart/*`, `/api/orders/*`)
*   `GET /api/cart` - Retrieve current active user cart synced with database.
*   `POST /api/orders` - Initialize order checkout session, creates temporary order records.
*   `POST /api/orders/pay` - Process Razorpay transaction webhook verify logic to confirm order placement.
*   `GET /api/orders/track/{trackingNumber}` - Public tracking utility.

### Administration (`/api/admin/*`)
*   `GET /api/admin/stats/dashboard` - Real-time statistics (total revenue, active orders, critical stock levels).
*   `POST /api/admin/products` - Insert new inventory listing (supports S3 multipart image upload).
*   `PUT /api/admin/orders/{id}/status` - Advance order lifecycle stage (updates transactional logs and triggers dispatch emails).
