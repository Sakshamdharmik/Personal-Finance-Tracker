import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import {ApiError} from "./utils/ApiError.js"

const app = express()

// CORS configuration - supports multiple origins when credentials are enabled
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || ['http://localhost:3000']

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or curl requests)
        if (!origin) return callback(null, true)
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true, limit:"16kb"}))
app.use(express.static("public"))

app.use(cookieParser())

// Root route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "CC Backend Practice API is running!",
        version: "1.0.0",
        endpoints: {
            user: {
                register: "POST /api/v1/users/register",
                login: "POST /api/v1/users/login",
                logout: "POST /api/v1/users/logout (requires auth)",
                refreshToken: "POST /api/v1/users/refresh-token"
            },
            transactions: {
                getAll: "GET /api/v1/transactions (requires auth)",
                create: "POST /api/v1/transactions (requires auth)",
                getOne: "GET /api/v1/transactions/:id (requires auth)",
                update: "PUT /api/v1/transactions/:id (requires auth)",
                delete: "DELETE /api/v1/transactions/:id (requires auth)",
                stats: "GET /api/v1/transactions/stats (requires auth)"
            },
            budgets: {
                getAll: "GET /api/v1/budgets (requires auth)",
                create: "POST /api/v1/budgets (requires auth)",
                getOne: "GET /api/v1/budgets/:id (requires auth)",
                update: "PUT /api/v1/budgets/:id (requires auth)",
                delete: "DELETE /api/v1/budgets/:id (requires auth)"
            },
            sharedAccounts: {
                getAll: "GET /api/v1/shared-accounts (requires auth)",
                create: "POST /api/v1/shared-accounts (requires auth)",
                getOne: "GET /api/v1/shared-accounts/:id (requires auth)",
                update: "PUT /api/v1/shared-accounts/:id (requires auth)",
                delete: "DELETE /api/v1/shared-accounts/:id (requires auth)",
                addMember: "POST /api/v1/shared-accounts/:id/members (requires auth)",
                removeMember: "DELETE /api/v1/shared-accounts/:id/members (requires auth)"
            }
        }
    })
})

// routes import
import userRouter from "./routes/user.routes.js"
import transactionRouter from "./routes/transaction.routes.js"
import budgetRouter from "./routes/budget.routes.js"
import sharedAccountRouter from "./routes/sharedAccount.routes.js"

// routes declaration
app.use("/api/v1/users",userRouter) // http://localhost:8000/api/v1/users/register
app.use("/api/v1/transactions",transactionRouter) // http://localhost:8000/api/v1/transactions
app.use("/api/v1/budgets",budgetRouter) // http://localhost:8000/api/v1/budgets
app.use("/api/v1/shared-accounts",sharedAccountRouter) // http://localhost:8000/api/v1/shared-accounts

// Global error handler middleware
app.use((err, req, res, next) => {
    // ApiError instance
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
            data: err.data || null
        })
    }
    
    // Unknown errors
    return res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: [],
        data: null
    })
})

export { app }