# SpendSync

 **A full-stack personal finance tracker** — track income & expenses, visualise spending trends, export reports, and stay in control of your money.

**Live Demo:** [https://spend-sync-gamma.vercel.app/](https://spend-sync-gamma.vercel.app/)

---

## 📸 Screenshots

| Landing Page | Dashboard | Transactions |
|---|---|---|
| Dark, animated hero with feature highlights | Monthly summary cards + bar chart | Search, filter, sort ledger with live stats |

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **JWT Authentication** | Register / Login with secure bcrypt-hashed passwords and stateless JWT tokens |
| 📊 **Dashboard** | Monthly income vs expense bar chart, net balance, category breakdown (Recharts) |
| 💳 **Transactions** | Add, edit, delete income & expense records with category, date, notes, and amount |
| 🔍 **Search & Filter** | Real-time search by description / category / amount; filter by type, category, date range |
| 📂 **Categories** | Pre-built income & expense categories with emoji icons and spending breakdown |
| 📄 **PDF Export** | Download a formatted financial statement PDF via jsPDF + jspdf-autotable |
| 📤 **CSV Export** | Export filtered transactions as a CSV file |
| 🌐 **Multi-currency** | Per-user currency preference stored in profile |
| 📧 **Email Reports** | Backend email report service (Spring Mail) |
| 🛡️ **Offline Fallback** | When the backend is unreachable, auth and transactions fall back to localStorage vault |
| 📱 **Responsive UI** | Fully responsive dark-theme UI — works on mobile, tablet, and desktop |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser / Client               │
│   React 19 + Vite + Tailwind CSS + Zustand       │
│   Deployed on Render (static) / Vercel           │
└─────────────────────┬───────────────────────────┘
                      │  HTTPS REST (Axios)
                      │  JWT Bearer token
┌─────────────────────▼───────────────────────────┐
│              Spring Boot 3 REST API              │
│   AuthController  │  TransactionController       │
│   Spring Security │  JWT Filter                  │
│   Deployed on Render (Docker)                    │
└─────────────────────┬───────────────────────────┘
                      │  Spring Data MongoDB
┌─────────────────────▼───────────────────────────┐
│           MongoDB Atlas (Cloud)                  │
│   Collections: users, transactions               │
└─────────────────────────────────────────────────┘
```

### Request Flow

```
User → React Page → Zustand Store → Axios Client
     → Spring Security (JWT filter)
     → Controller → Service → Repository → MongoDB
     → JSON Response → Store → React re-render
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.x | UI framework |
| **Vite** | 8.x | Build tool & dev server |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **Zustand** | 5.x | Global state management |
| **React Router** | 7.x | Client-side routing |
| **Recharts** | 3.x | Charts & data visualisation |
| **Axios** | 1.x | HTTP client |
| **Lucide React** | latest | Icon library |
| **jsPDF** | 4.x | PDF generation |
| **jspdf-autotable** | 5.x | Table layout in PDFs |
| **react-csv** | 2.x | CSV export |
| **react-hot-toast** | 2.x | Toast notifications |
| **date-fns** | 4.x | Date formatting helpers |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Java** | 17 | Language |
| **Spring Boot** | 3.2.5 | Application framework |
| **Spring Security** | 6.x | Authentication & authorisation |
| **Spring Data MongoDB** | 4.x | Database ORM |
| **Spring Mail** | 3.x | Email report service |
| **jjwt (JJWT)** | 0.12.5 | JWT creation & validation |
| **Lombok** | latest | Boilerplate reduction |
| **Apache Commons CSV** | 1.10.0 | CSV processing |
| **Maven** | 3.x | Build & dependency management |

### Infrastructure
| Service | Purpose |
|---|---|
| **MongoDB Atlas** | Cloud database (M0 Free Tier) |
| **Render** | Backend hosting (Docker container) |
| **Vercel / Render Static** | Frontend hosting |
| **Docker** | Containerisation |
| **Docker Compose** | Local multi-service orchestration |

---

## 📁 Project Structure

```
SpendSync/
├── client/                          # React frontend
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── manifest.json            # PWA manifest
│   │   └── _redirects               # Netlify SPA fallback
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js            # Axios instance (env-aware base URL)
│   │   ├── components/
│   │   │   ├── AuthLayout.jsx       # Auth page wrapper
│   │   │   ├── Header.jsx           # Top navigation bar
│   │   │   ├── ProtectedRoute.jsx   # JWT-guarded route wrapper
│   │   │   ├── RequestError.jsx     # Reusable error banner
│   │   │   ├── Reveal.jsx           # Scroll-reveal animation
│   │   │   ├── Sidebar.jsx          # Left navigation sidebar
│   │   │   ├── TransactionItem.jsx  # Single transaction row
│   │   │   └── TransactionModal.jsx # Add / edit transaction modal
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx      # Public marketing page
│   │   │   ├── LoginPage.jsx        # Sign-in form
│   │   │   ├── RegisterPage.jsx     # Sign-up form
│   │   │   ├── DashboardPage.jsx    # Overview charts & KPI cards
│   │   │   ├── TransactionsPage.jsx # Full transaction ledger
│   │   │   ├── CategoriesPage.jsx   # Spending by category
│   │   │   ├── AnalyticsPage.jsx    # Trend charts & analytics
│   │   │   ├── ExportPage.jsx       # PDF / CSV export
│   │   │   └── SettingsPage.jsx     # Profile & preferences
│   │   ├── store/
│   │   │   ├── authStore.js         # Zustand auth state + offline vault
│   │   │   └── transactionStore.js  # Zustand transactions + localStorage CRUD
│   │   ├── utils/
│   │   │   ├── constants.js         # Categories, formatCurrency, helpers
│   │   │   └── pdfExport.js         # jsPDF financial statement generator
│   │   ├── App.jsx                  # Route definitions
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global dark theme styles
│   ├── .env                         # VITE_API_BASE_URL (not committed)
│   ├── vercel.json                  # Vercel SPA rewrite rules
│   ├── vite.config.js               # Vite + Tailwind plugin
│   ├── nginx.conf                   # Nginx config for Docker
│   └── Dockerfile                   # Frontend Docker image
│
├── server/                          # Spring Boot backend
│   └── src/main/java/com/spendsync/api/
│       ├── SpendSyncApplication.java          # Main entry point
│       ├── config/
│       │   └── SecurityConfig.java            # CORS, JWT filter, security chain
│       ├── controller/
│       │   ├── AuthController.java            # POST /api/auth/register, /login
│       │   └── TransactionController.java     # CRUD /api/transactions, dashboard
│       ├── dto/
│       │   ├── LoginRequest.java
│       │   ├── RegisterRequest.java
│       │   ├── TransactionRequest.java
│       │   ├── AuthResponse.java
│       │   ├── TransactionResponse.java
│       │   └── DashboardSummaryResponse.java
│       ├── exception/
│       │   ├── BadRequestException.java
│       │   ├── ResourceNotFoundException.java
│       │   └── GlobalExceptionHandler.java    # @ControllerAdvice error handler
│       ├── model/
│       │   ├── User.java                      # MongoDB document
│       │   └── Transaction.java               # MongoDB document
│       ├── repository/
│       │   ├── UserRepository.java
│       │   └── TransactionRepository.java
│       ├── security/
│       │   ├── JwtTokenProvider.java          # Sign & validate JWT
│       │   ├── JwtAuthenticationFilter.java   # Per-request JWT filter
│       │   └── CustomUserDetailsService.java
│       └── service/
│           ├── AuthService.java               # Register, login logic
│           ├── TransactionService.java        # Business logic, dashboard calc
│           └── EmailReportService.java        # Email report sender
│   └── src/main/resources/
│       └── application.yml                    # App config (port, MongoDB, JWT, CORS)
│   ├── .env                                   # Server secrets (not committed)
│   ├── Dockerfile                             # Backend Docker image
│   └── pom.xml                                # Maven dependencies
│
├── docker-compose.yml               # Run frontend + backend locally with Docker
├── .env.example                     # Template for environment variables
├── .gitignore
└── README.md
```

---

## 🔌 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Create a new account | ❌ Public |
| `POST` | `/api/auth/login` | Sign in, returns JWT token | ❌ Public |

### Transactions — `/api/transactions`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/transactions` | List all transactions (with optional filters) | ✅ JWT |
| `POST` | `/api/transactions` | Create a new transaction | ✅ JWT |
| `PUT` | `/api/transactions/{id}` | Update a transaction | ✅ JWT |
| `DELETE` | `/api/transactions/{id}` | Delete a transaction | ✅ JWT |
| `GET` | `/api/transactions/dashboard` | Monthly summary + KPI data | ✅ JWT |
| `GET` | `/api/transactions/export/csv` | Download transactions as CSV | ✅ JWT |

---

## ⚙️ Environment Variables

### Client (`client/.env`)
```env
VITE_API_BASE_URL=https://spendsync-9si7.onrender.com
```

### Server (`server/.env`)
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/spendsync
JWT_SECRET=your-256-bit-secret
JWT_EXPIRATION=86400000
ALLOWED_ORIGINS=https://your-frontend.vercel.app
MAIL_USERNAME=your@email.com
MAIL_PASSWORD=your-app-password
```

> See [`.env.example`](.env.example) for the full template.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Java 17+
- Maven 3.8+
- MongoDB Atlas account (free tier)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/SpendSync.git
cd SpendSync
```

### 2. Backend Setup
```bash
cd server
# Copy and fill in your secrets
cp ../.env.example .env

# Run with Maven
mvn spring-boot:run
# API available at http://localhost:8080
```

### 3. Frontend Setup
```bash
cd client
npm install

# Create local env file
echo "VITE_API_BASE_URL=http://localhost:8080" > .env

npm run dev
# App available at http://localhost:5173
```

### 4. Docker (Full Stack)
```bash
# From project root
docker-compose up --build
# Frontend → http://localhost:80
# Backend  → http://localhost:8080
```

---

## ☁️ Deployment

### Backend → Render
1. Push code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set **Runtime** → Docker, **Root Directory** → `server`
4. Add environment variables in the Render dashboard:
   - `MONGODB_URI`, `JWT_SECRET`, `ALLOWED_ORIGINS`, etc.
5. MongoDB Atlas → **Network Access** → add `0.0.0.0/0` (Render uses dynamic IPs)

### Frontend → Vercel
1. Create a new project on [Vercel](https://vercel.com)
2. Set **Root Directory** → `client`, **Framework** → Vite
3. Add env var: `VITE_API_BASE_URL=https://spendsync-9si7.onrender.com`
4. Deploy — Vercel handles the SPA rewrite via `vercel.json`

---

## 🧪 Running Tests

```bash
# Frontend unit tests (Vitest)
cd client
npm test

# Backend tests (JUnit)
cd server
mvn test
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<div align="center">
  Built with ❤️ using React, Spring Boot & MongoDB
</div>
