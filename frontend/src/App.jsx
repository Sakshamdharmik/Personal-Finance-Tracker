import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Register from './pages/Register'
import Login from './pages/Login'
import FinanceDashboard from './pages/FinanceDashboard'
import Transactions from './pages/Transactions'
import TransactionForm from './pages/TransactionForm'
import Budgets from './pages/Budgets'
import BudgetForm from './pages/BudgetForm'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <FinanceDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/new"
            element={
              <ProtectedRoute>
                <TransactionForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/:id/edit"
            element={
              <ProtectedRoute>
                <TransactionForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budgets"
            element={
              <ProtectedRoute>
                <Budgets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budgets/new"
            element={
              <ProtectedRoute>
                <BudgetForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budgets/:id/edit"
            element={
              <ProtectedRoute>
                <BudgetForm />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
