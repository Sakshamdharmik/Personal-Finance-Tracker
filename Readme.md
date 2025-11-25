# Personal Finance Tracker

## Overview

The **Personal Finance Tracker** is a comprehensive web-based application built using the **MERN stack (MongoDB, Express.js, React.js, Node.js)** that helps users manage their income, expenses, and financial goals effectively. This application enables users to track their transactions, categorize expenses, visualize spending patterns, set budgets, and maintain financial discipline.

## ✨ Features

### 🔐 Authentication & Security
- **User Authentication:** Secure user registration and login with JWT authentication
- **Token Management:** Access tokens and refresh tokens with automatic refresh
- **Protected Routes:** Secure API endpoints with JWT middleware
- **Password Security:** Bcrypt password hashing

### 💸 Transaction Management
- **Add Transactions:** Create income and expense transactions with categories
- **Edit Transactions:** Update existing transactions
- **Delete Transactions:** Remove transactions with confirmation
- **Transaction Categories:** 
  - Income: Salary, Freelance, Investment, Business, Gift, Other Income
  - Expenses: Food, Rent, Utilities, Transportation, Entertainment, Shopping, Healthcare, Education, Travel, Bills, Other Expense
- **Recurring Transactions:** Support for recurring income/expense patterns
- **Transaction Tags:** Add custom tags to transactions

### 📊 Analytics & Insights
- **Interactive Charts:**
  - Pie charts for Income vs Expenses
  - Pie charts for expense category breakdown
  - Bar charts for income and expense categories
  - Line charts for monthly balance trends
- **Financial Summaries:** Real-time income, expense, and balance calculations
- **Category Breakdown:** Detailed spending by category
- **Spending Trends:** Visual representation of financial patterns

### 💵 Budget Management
- **Create Budgets:** Set budgets for expense categories
- **Budget Periods:** Weekly, monthly, or yearly budgets
- **Budget Tracking:** Real-time tracking of budget usage
- **Budget Alerts:** Automatic alerts when budgets are exceeded or near threshold
- **Progress Visualization:** Visual progress bars with color-coded indicators
- **Budget Notifications:** Customizable notification thresholds

### 👥 Shared Accounts (Multi-User Support)
- **Create Shared Accounts:** Set up shared financial accounts with multiple users
- **Member Management:** Add/remove members with role-based permissions
- **Shared Transactions:** Track transactions across shared accounts
- **Permission Control:** Admin and member roles with customizable permissions
- **Shared Budgets:** Create budgets for shared accounts

### 🔍 Filters & Sorting
- **Advanced Filtering:** Filter by type, category, date range, amount range
- **Sorting Options:** Sort by date, amount (ascending/descending)
- **Pagination:** Efficient pagination for large transaction lists
- **Real-time Updates:** Filters update results instantly

### 🎨 User Interface
- **Modern Design:** Beautiful, responsive UI with gradient themes
- **Sidebar Navigation:** Easy navigation between modules
- **Dark Theme:** Professional dark theme with accent colors
- **Responsive Layout:** Works seamlessly on desktop, tablet, and mobile
- **Interactive Elements:** Smooth animations and hover effects

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js 4.21.2
- **Database:** MongoDB with Mongoose 8.9.2
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **File Upload:** Multer 1.4.5 + Cloudinary 2.5.1
- **Password Hashing:** bcrypt 5.1.1
- **Pagination:** mongoose-aggregate-paginate-v2 1.1.2

### Frontend
- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.0.8
- **Routing:** React Router DOM 6.20.0
- **HTTP Client:** Axios 1.6.2
- **Styling:** CSS3 with CSS Variables

## 📁 Project Structure

```
CC Backend Practice/
├── src/                          # Backend source code
│   ├── app.js                    # Express app configuration
│   ├── index.js                  # Server entry point
│   ├── constants.js              # Database constants
│   ├── contollers/               # Controllers
│   │   ├── user.controller.js
│   │   ├── transaction.controller.js
│   │   ├── budget.controller.js
│   │   └── sharedAccount.controller.js
│   ├── models/                   # Mongoose models
│   │   ├── user.model.js
│   │   ├── transaction.model.js
│   │   ├── budget.model.js
│   │   └── sharedAccount.model.js
│   ├── routes/                   # API routes
│   │   ├── user.routes.js
│   │   ├── transaction.routes.js
│   │   ├── budget.routes.js
│   │   └── sharedAccount.routes.js
│   ├── middlewares/              # Custom middlewares
│   │   ├── auth.middleware.js
│   │   └── multer.middleware.js
│   ├── utils/                    # Utility functions
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   └── cloudinary.js
│   └── db/                       # Database connection
│       └── index.js
├── frontend/                     # Frontend React application
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── BudgetAlerts.jsx
│   │   │   ├── AnalyticsCharts.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/                # Page components
│   │   │   ├── FinanceDashboard.jsx
│   │   │   ├── Transactions.jsx
│   │   │   ├── TransactionForm.jsx
│   │   │   ├── Budgets.jsx
│   │   │   ├── BudgetForm.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── context/              # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── services/             # API services
│   │   │   └── api.js
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── public/                       # Static files
│   └── temp/                     # Temporary uploads
├── package.json
└── Readme.md
```

## 🚀 Installation & Setup

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (Local or Cloud - MongoDB Atlas)
- **Cloudinary Account** (for image uploads)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Sakshamdharmik/Personal-Finance-Tracker.git
cd Personal-Finance-Tracker
```

### Step 2: Install Backend Dependencies

```bash
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Step 4: Environment Variables

Create a `.env` file in the root directory:

```env
PORT=8000
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/
CORS_ORIGIN=http://localhost:3000

ACCESS_TOKEN_SECRET=your_access_token_secret_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Step 5: Run the Application

**Option 1: Run Separately (Recommended for Development)**

Terminal 1 - Backend:
```bash
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

**Option 2: Run Both Together**

Add to root `package.json`:
```json
"scripts": {
  "dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js",
  "dev:frontend": "cd frontend && npm run dev",
  "dev:all": "concurrently \"npm run dev\" \"npm run dev:frontend\""
}
```

Then install concurrently:
```bash
npm install --save-dev concurrently
```

Run both:
```bash
npm run dev:all
```

### Step 6: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Root:** http://localhost:8000/ (shows available endpoints)

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/users/register` | Register new user | No |
| POST | `/api/v1/users/login` | User login | No |
| POST | `/api/v1/users/logout` | User logout | Yes |
| POST | `/api/v1/users/refresh-token` | Refresh access token | No |

### Transactions
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/transactions` | Get all transactions (with filters) | Yes |
| GET | `/api/v1/transactions/stats` | Get transaction statistics | Yes |
| GET | `/api/v1/transactions/:id` | Get single transaction | Yes |
| POST | `/api/v1/transactions` | Create new transaction | Yes |
| PUT | `/api/v1/transactions/:id` | Update transaction | Yes |
| DELETE | `/api/v1/transactions/:id` | Delete transaction | Yes |

**Query Parameters for GET /api/v1/transactions:**
- `type`: Filter by type (income/expense)
- `category`: Filter by category
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `minAmount`: Minimum amount
- `maxAmount`: Maximum amount
- `sortBy`: Sort field (date, amount, createdAt)
- `sortOrder`: Sort order (asc, desc)
- `page`: Page number
- `limit`: Items per page

### Budgets
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/budgets` | Get all budgets | Yes |
| GET | `/api/v1/budgets/:id` | Get single budget | Yes |
| POST | `/api/v1/budgets` | Create new budget | Yes |
| PUT | `/api/v1/budgets/:id` | Update budget | Yes |
| DELETE | `/api/v1/budgets/:id` | Delete budget | Yes |

### Shared Accounts
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/shared-accounts` | Get all shared accounts | Yes |
| GET | `/api/v1/shared-accounts/:id` | Get single shared account | Yes |
| POST | `/api/v1/shared-accounts` | Create shared account | Yes |
| PUT | `/api/v1/shared-accounts/:id` | Update shared account | Yes |
| DELETE | `/api/v1/shared-accounts/:id` | Delete shared account | Yes |
| POST | `/api/v1/shared-accounts/:id/members` | Add member | Yes |
| DELETE | `/api/v1/shared-accounts/:id/members` | Remove member | Yes |

## 🎯 Key Features Explained

### Budget Alerts
- Automatically monitors all active budgets
- Shows alerts when budget is exceeded (red)
- Shows warnings when budget is near threshold (yellow)
- Updates every 30 seconds
- Displays percentage used and remaining amount

### Analytics Dashboard
- **Income vs Expenses Pie Chart:** Visual comparison of total income and expenses
- **Expense Categories Pie Chart:** Breakdown of spending by category
- **Category Bar Charts:** Horizontal bar charts for income and expense categories
- **Monthly Balance Trend:** Line chart showing net balance over time

### Transaction Filtering
- Filter by transaction type (income/expense)
- Filter by category
- Filter by date range
- Filter by amount range
- Sort by date or amount
- Pagination support

### Recurring Transactions
- Set up recurring income or expenses
- Support for daily, weekly, monthly, yearly frequencies
- Automatic next date calculation
- Optional end date

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- HTTP-only cookies for tokens
- CORS configuration
- Input validation
- Protected API routes
- Secure file uploads via Cloudinary

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🚀 Deployment

### Backend Deployment
1. Set environment variables on hosting platform
2. Ensure MongoDB connection string is accessible
3. Deploy to platforms like:
   - Heroku
   - Railway
   - Render
   - AWS
   - DigitalOcean

### Frontend Deployment
1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy `dist` folder to:
   - Vercel
   - Netlify
   - GitHub Pages
   - AWS S3 + CloudFront

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

ISC

## 👤 Author

**Saksham Dharmik**

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Cloudinary for image storage
- React and Express.js communities

---

**Note:** Make sure to keep your `.env` file secure and never commit it to version control.
