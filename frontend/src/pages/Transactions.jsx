import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTransactions, deleteTransaction } from '../services/api'
import Sidebar from '../components/Sidebar'
import './Transactions.css'

const Transactions = () => {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    sortBy: 'date',
    sortOrder: 'desc'
  })
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })

  useEffect(() => {
    fetchTransactions()
  }, [filters, pagination.page])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await getTransactions({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      })
      setTransactions(response.data.transactions)
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages
      }))
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id)
        fetchTransactions()
      } catch (error) {
        console.error('Error deleting transaction:', error)
      }
    }
  }

  return (
    <div className="transactions-page">
      <Sidebar />
      <div className="page-content">
        <div className="page-header">
          <h1>Transactions</h1>
          <button onClick={() => navigate('/transactions/new')} className="btn btn-primary">
            + Add Transaction
          </button>
        </div>

      <div className="filters-panel">
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
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
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
        />
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-')
            setFilters({ ...filters, sortBy, sortOrder })
          }}
        >
          <option value="date-desc">Date (Newest)</option>
          <option value="date-asc">Date (Oldest)</option>
          <option value="amount-desc">Amount (High to Low)</option>
          <option value="amount-asc">Amount (Low to High)</option>
        </select>
        <button onClick={() => setFilters({ type: '', category: '', startDate: '', endDate: '', sortBy: 'date', sortOrder: 'desc' })}>
          Clear
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading transactions...</p>
        </div>
      ) : transactions.length > 0 ? (
        <>
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
          <div className="pagination">
            <button
              disabled={pagination.page === 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            >
              Previous
            </button>
            <span>Page {pagination.page} of {pagination.pages || 1}</span>
            <button
              disabled={pagination.page >= (pagination.pages || 1)}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No transactions found</h3>
          <p>Start tracking your finances by adding your first transaction</p>
          <button onClick={() => navigate('/transactions/new')} className="btn btn-primary">
            + Add Transaction
          </button>
        </div>
      )}
      </div>
    </div>
  )
}

export default Transactions

