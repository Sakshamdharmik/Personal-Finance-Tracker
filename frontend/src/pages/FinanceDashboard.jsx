import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTransactions, getTransactionStats, deleteTransaction } from '../services/api'
import Sidebar from '../components/Sidebar'
import BudgetAlerts from '../components/BudgetAlerts'
import AnalyticsCharts from '../components/AnalyticsCharts'
import './FinanceDashboard.css'

const FinanceDashboard = () => {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchData()
  }, [filters])

  const [allTransactions, setAllTransactions] = useState([])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [transactionsRes, statsRes, allTransactionsRes] = await Promise.all([
        getTransactions({ ...filters, limit: 10, sortBy: 'date', sortOrder: 'desc' }),
        getTransactionStats(filters),
        getTransactions({ ...filters, limit: 200, sortBy: 'date', sortOrder: 'desc' })
      ])
      setTransactions(transactionsRes.data.transactions)
      setStats(statsRes.data)
      setAllTransactions(allTransactionsRes.data.transactions || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id)
        fetchData()
      } catch (error) {
        console.error('Error deleting transaction:', error)
      }
    }
  }

  const incomeCategories = stats?.income?.categories || []
  const expenseCategories = stats?.expense?.categories || []

  return (
    <div className="finance-dashboard">
      <Sidebar />
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <button onClick={() => navigate('/transactions/new')} className="btn btn-primary">
            + Add Transaction
          </button>
        </div>

        <div className="dashboard-content">
          {/* Budget Alerts */}
          <BudgetAlerts />
          
          {/* Analytics Charts */}
          {stats && allTransactions.length > 0 && (
            <AnalyticsCharts stats={stats} transactions={allTransactions} />
          )}
          
        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card income">
            <h3>Total Income</h3>
            <p className="amount">${stats?.income?.total?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="summary-card expense">
            <h3>Total Expenses</h3>
            <p className="amount">${stats?.expense?.total?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="summary-card balance">
            <h3>Balance</h3>
            <p className="amount">${stats?.balance?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <h3>Filters</h3>
          <div className="filters">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              <option value="Food">Food</option>
              <option value="Rent">Rent</option>
              <option value="Salary">Salary</option>
              <option value="Entertainment">Entertainment</option>
            </select>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              placeholder="Start Date"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              placeholder="End Date"
            />
            <button onClick={() => setFilters({ type: '', category: '', startDate: '', endDate: '' })}>
              Clear
            </button>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="category-breakdown">
          <div className="breakdown-section">
            <h3>Income by Category</h3>
            <div className="category-list">
              {incomeCategories.length > 0 ? (
                incomeCategories.map((cat, idx) => (
                  <div key={idx} className="category-item">
                    <span>{cat.category}</span>
                    <span>${cat.total.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p>No income transactions</p>
              )}
            </div>
          </div>
          <div className="breakdown-section">
            <h3>Expenses by Category</h3>
            <div className="category-list">
              {expenseCategories.length > 0 ? (
                expenseCategories.map((cat, idx) => (
                  <div key={idx} className="category-item">
                    <span>{cat.category}</span>
                    <span>${cat.total.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p>No expense transactions</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="recent-transactions">
          <div className="section-header">
            <h3>Recent Transactions</h3>
            <button onClick={() => navigate('/transactions')} className="btn btn-link">
              View All
            </button>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : transactions.length > 0 ? (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${transaction.type}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td>{transaction.category}</td>
                    <td>{transaction.description || '-'}</td>
                    <td className={transaction.type}>
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td>
                      <button
                        onClick={() => navigate(`/transactions/${transaction._id}/edit`)}
                        className="btn-icon"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(transaction._id)}
                        className="btn-icon"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No transactions found</p>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}

export default FinanceDashboard

