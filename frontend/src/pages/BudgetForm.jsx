import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createBudget, getBudget, updateBudget } from '../services/api'
import Sidebar from '../components/Sidebar'
import './BudgetForm.css'

const BudgetForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notifications: {
      enabled: true,
      threshold: 80
    }
  })

  useEffect(() => {
    if (isEdit) {
      fetchBudget()
    }
  }, [id])

  const fetchBudget = async () => {
    try {
      const response = await getBudget(id)
      const budget = response.data
      setFormData({
        category: budget.category,
        amount: budget.amount,
        period: budget.period,
        startDate: new Date(budget.startDate).toISOString().split('T')[0],
        endDate: budget.endDate ? new Date(budget.endDate).toISOString().split('T')[0] : '',
        notifications: budget.notifications || { enabled: true, threshold: 80 }
      })
    } catch (error) {
      console.error('Error fetching budget:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEdit) {
        await updateBudget(id, formData)
      } else {
        await createBudget(formData)
      }
      navigate('/budgets')
    } catch (error) {
      console.error('Error saving budget:', error)
      alert(error.response?.data?.message || 'Error saving budget')
    } finally {
      setLoading(false)
    }
  }

  const expenseCategories = ['Food', 'Rent', 'Utilities', 'Transportation', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Travel', 'Bills', 'Other Expense']

  return (
    <div className="budget-form-page">
      <Sidebar />
      <div className="page-content">
        <div className="form-container">
        <h1>{isEdit ? 'Edit Budget' : 'Create New Budget'}</h1>
        <form onSubmit={handleSubmit} className="budget-form">
          <div className="form-group">
            <label>Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select category</option>
              {expenseCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Budget Amount *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label>Period *</label>
            <select
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              required
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="form-group">
            <label>Start Date *</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date (Optional)</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
            <small>Leave empty for ongoing budget</small>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.notifications.enabled}
                onChange={(e) => setFormData({
                  ...formData,
                  notifications: { ...formData.notifications, enabled: e.target.checked }
                })}
              />
              Enable Notifications
            </label>
          </div>

          {formData.notifications.enabled && (
            <div className="form-group">
              <label>Notification Threshold (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.notifications.threshold}
                onChange={(e) => setFormData({
                  ...formData,
                  notifications: { ...formData.notifications, threshold: parseInt(e.target.value) }
                })}
              />
              <small>Notify when this percentage of budget is used</small>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/budgets')} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Budget' : 'Create Budget'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}

export default BudgetForm

