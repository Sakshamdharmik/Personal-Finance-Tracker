import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBudgets, deleteBudget } from '../services/api'
import Sidebar from '../components/Sidebar'
import './Budgets.css'

const Budgets = () => {
  const navigate = useNavigate()
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const response = await getBudgets({ isActive: true })
      setBudgets(response.data)
    } catch (error) {
      console.error('Error fetching budgets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(id)
        fetchBudgets()
      } catch (error) {
        console.error('Error deleting budget:', error)
      }
    }
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'var(--error)'
    if (percentage >= 80) return 'var(--warning)'
    return 'var(--success)'
  }

  return (
    <div className="budgets-page">
      <Sidebar />
      <div className="page-content">
        <div className="page-header">
          <h1>Budgets</h1>
          <button onClick={() => navigate('/budgets/new')} className="btn btn-primary">
            + Create Budget
          </button>
        </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading budgets...</p>
        </div>
      ) : budgets.length > 0 ? (
        <div className="budgets-grid">
          {budgets.map((budget) => {
            const percentage = budget.percentage || 0
            return (
              <div key={budget._id} className="budget-card">
                <div className="budget-header">
                  <h3>{budget.category}</h3>
                  <span className="budget-period">{budget.period}</span>
                </div>
                <div className="budget-amounts">
                  <div className="amount-item">
                    <span className="label">Budget</span>
                    <span className="value">${budget.amount.toFixed(2)}</span>
                  </div>
                  <div className="amount-item">
                    <span className="label">Spent</span>
                    <span className="value spent">${budget.spent?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="amount-item">
                    <span className="label">Remaining</span>
                    <span className="value remaining">${budget.remaining?.toFixed(2) || budget.amount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: getProgressColor(percentage)
                    }}
                  />
                </div>
                <div className="progress-text">
                  {percentage.toFixed(1)}% used
                </div>
                <div className="budget-actions">
                  <button
                    onClick={() => navigate(`/budgets/${budget._id}/edit`)}
                    className="btn btn-small"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(budget._id)}
                    className="btn btn-small btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="empty-state">
          <p>No budgets created yet</p>
          <button onClick={() => navigate('/budgets/new')} className="btn btn-primary">
            Create Your First Budget
          </button>
        </div>
      )}
      </div>
    </div>
  )
}

export default Budgets

