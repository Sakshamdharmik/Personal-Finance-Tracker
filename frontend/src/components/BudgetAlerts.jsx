import { useState, useEffect } from 'react'
import { getBudgets } from '../services/api'
import './BudgetAlerts.css'

const BudgetAlerts = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
    // Refresh alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const response = await getBudgets({ isActive: true })
      const budgets = response.data || []
      
      const budgetAlerts = budgets
        .filter(budget => {
          const percentage = budget.percentage || 0
          const spent = budget.spent || 0
          const amount = budget.amount || 0
          
          // Alert if exceeded or near threshold
          return spent >= amount || 
                 (budget.notifications?.enabled && 
                  percentage >= (budget.notifications?.threshold || 80))
        })
        .map(budget => ({
          id: budget._id,
          category: budget.category,
          amount: budget.amount,
          spent: budget.spent || 0,
          remaining: budget.remaining || 0,
          percentage: budget.percentage || 0,
          isExceeded: (budget.spent || 0) >= budget.amount,
          threshold: budget.notifications?.threshold || 80
        }))
      
      setAlerts(budgetAlerts)
    } catch (error) {
      console.error('Error fetching budget alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="budget-alerts">
        <div className="alerts-header">
          <h3>⚠️ Budget Alerts</h3>
        </div>
        <p>Loading...</p>
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div className="budget-alerts">
        <div className="alerts-header">
          <h3>✅ Budget Status</h3>
        </div>
        <div className="no-alerts">
          <p>All budgets are within limits!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="budget-alerts">
      <div className="alerts-header">
        <h3>⚠️ Budget Alerts</h3>
        <span className="alert-count">{alerts.length}</span>
      </div>
      <div className="alerts-list">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`alert-item ${alert.isExceeded ? 'exceeded' : 'warning'}`}
          >
            <div className="alert-icon">
              {alert.isExceeded ? '🚨' : '⚠️'}
            </div>
            <div className="alert-content">
              <div className="alert-category">{alert.category}</div>
              <div className="alert-details">
                {alert.isExceeded ? (
                  <span className="alert-message">
                    Budget exceeded by ${Math.abs(alert.remaining).toFixed(2)}
                  </span>
                ) : (
                  <span className="alert-message">
                    {alert.percentage.toFixed(1)}% used (${alert.spent.toFixed(2)} / ${alert.amount.toFixed(2)})
                  </span>
                )}
              </div>
            </div>
            <div className="alert-percentage">
              {alert.percentage.toFixed(0)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BudgetAlerts

