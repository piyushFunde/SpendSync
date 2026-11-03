# SpendSync — Personal Finance Tracker

> A full-stack personal finance tracker with stunning dark UI, JWT authentication, interactive charts, and smart analytics.

---

##  Features

| Feature | Description |
|---|---|
| **JWT Authentication** | Secure register/login with bcrypt hashing |
| **Transaction CRUD** | Add, edit, delete income & expense transactions |
|  **Interactive Charts** | Bar, Area, Pie charts powered by Recharts |
|  **Advanced Filters** | Filter by type, category, and date range |
|  **CSV Export** | Download transactions as CSV |
|  **Monthly Reports** | Automated email summaries via Nodemailer |
|  **PWA Support** | Installable on mobile as a native-like app |
|  **Premium Dark UI** | Glassmorphism, animations, responsive design |
|  **Recurring Transactions** | Mark transactions as daily/weekly/monthly |
|  **Analytics Page** | Savings rate, spending breakdown, trends |

---

##  Tech Stack

```
Frontend:        React 18 + Vite + Tailwind CSS v4
State:           Zustand (with persist middleware)
Charts:          Recharts (Bar, Pie, Area, Line)
HTTP Client:     Axios (with JWT interceptors)
Router:          React Router DOM v6
Toasts:          React Hot Toast

Backend:         Spring Boot 3.2 (Java 17)
Auth:            Spring Security + JWT (JJWT 0.12)
Database:        MongoDB (via Spring Data MongoDB)
Email:           Spring Mail (JavaMailSender)
CSV:             Apache Commons CSV
Build:           Maven
```

---

##  Getting Started

### Prerequisites
- Node.js 18+
- Java 17+
- Maven 3.8+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/SpendSync.git
cd SpendSync
```

### 2. Backend Setup

```bash
cd server

# Copy environment template
cp ../.env.example .env
# Configure JWT_SECRET (at least 32 random characters) in your shell or IDE
# environment before starting the backend. Spring Boot does not load .env files
# automatically; set other values from .env the same way when needed.

# Run with Maven
./mvnw spring-boot:run

# Or build and run
./mvnw clean package -DskipTests
java -jar target/spendsync-api-1.0.0.jar
```

The API will start on `http://localhost:8080`

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will start on `http://localhost:5173`

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login & get JWT token |

### Transactions ( JWT Required)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/transactions` | List transactions (with filters) |
| POST | `/api/transactions` | Create transaction |
| GET | `/api/transactions/:id` | Get single transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/transactions/dashboard` | Dashboard summary |
| GET | `/api/transactions/export/csv` | Export as CSV |

### Query Parameters (GET /transactions)
- `type` — `INCOME` or `EXPENSE`
- `category` — category label
- `startDate` — ISO date (YYYY-MM-DD)
- `endDate` — ISO date (YYYY-MM-DD)

---

##  Project Structure

```
SpendSync/
├── client/                          # React Frontend
│   ├── public/
│   │   ├── manifest.json            # PWA Manifest
│   │   └── icon.svg                 # App Icon
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js            # Axios instance + API methods
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx   # Auth guard
│   │   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   │   ├── TransactionItem.jsx  # Transaction list item
│   │   │   └── TransactionModal.jsx # Add/Edit transaction form
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx        # Auth page
│   │   │   ├── RegisterPage.jsx     # Registration page
│   │   │   ├── DashboardPage.jsx    # Main dashboard
│   │   │   ├── TransactionsPage.jsx # Transaction list
│   │   │   ├── AnalyticsPage.jsx    # Charts & analytics
│   │   │   └── SettingsPage.jsx     # User settings
│   │   ├── store/
│   │   │   ├── authStore.js         # Zustand auth store
│   │   │   └── transactionStore.js  # Zustand transaction store
│   │   ├── utils/
│   │   │   └── constants.js         # Categories, formatters
│   │   ├── App.jsx                  # Router + layout
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles + design system
│   ├── index.html
│   └── vite.config.js
│
└── server/                          # Spring Boot Backend
    ├── src/main/java/com/spendsync/api/
    │   ├── config/
    │   │   └── SecurityConfig.java  # Spring Security + CORS
    │   ├── controller/
    │   │   ├── AuthController.java  # POST /auth/register, login
    │   │   └── TransactionController.java
    │   ├── dto/
    │   │   ├── request/             # RegisterRequest, LoginRequest, TransactionRequest
    │   │   └── response/            # AuthResponse, TransactionResponse, DashboardSummaryResponse
    │   ├── exception/
    │   │   ├── GlobalExceptionHandler.java
    │   │   ├── BadRequestException.java
    │   │   └── ResourceNotFoundException.java
    │   ├── model/
    │   │   ├── User.java            # MongoDB User document
    │   │   └── Transaction.java     # MongoDB Transaction document
    │   ├── repository/
    │   │   ├── UserRepository.java
    │   │   └── TransactionRepository.java
    │   ├── security/
    │   │   ├── JwtTokenProvider.java    # JWT generate/validate
    │   │   ├── JwtAuthenticationFilter.java
    │   │   └── CustomUserDetailsService.java
    │   └── service/
    │       ├── AuthService.java         # Register/Login logic
    │       ├── TransactionService.java  # CRUD + dashboard aggregation
    │       └── EmailReportService.java  # Scheduled monthly email reports
    └── src/main/resources/
        └── application.yml              # App configuration
```

---

## 🌐 Deployment

### Frontend (Vercel)
1. Push `client/` to GitHub
2. Import to [Vercel](https://vercel.com)
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add env: `VITE_API_BASE_URL=https://your-backend.onrender.com`

### Backend (Render)
1. Connect GitHub repo to [Render](https://render.com)
2. Select **Web Service** → Java
3. Build command: `cd server && mvn clean package -DskipTests`
4. Start command: `java -jar server/target/spendsync-api-1.0.0.jar`
5. Set environment variables from `.env.example`

---

##  Key Industry Concepts Demonstrated

- JWT Authentication & Authorization
-  RESTful API Design (controller/service/repository pattern)
-  MongoDB data modeling with Spring Data
-  Global exception handling with structured error responses
-  Zustand state management with persistence
-  Protected routes in React Router
-  Axios interceptors for token injection
-  Data visualization with Recharts
-  Responsive mobile-first UI
-  PW with install prompt
-  CSV export from backend streaming
- Scheduled tasks with Spring @Scheduled

---
