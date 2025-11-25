import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createTransaction, getTransaction, updateTransaction } from '../services/api'
import Sidebar from '../components/Sidebar'
import './TransactionForm.css'

const TransactionForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    tags: []
  })

  useEffect(() => {
    if (isEdit) {
      fetchTransaction()
    }
  }, [id])

  const fetchTransaction = async () => {
    try {
      const response = await getTransaction(id)
      const transaction = response.data
      setFormData({
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description || '',
        date: new Date(transaction.date).toISOString().split('T')[0],
        isRecurring: transaction.isRecurring || false,
        tags: transaction.tags || []
      })
    } catch (error) {
      console.error('Error fetching transaction:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEdit) {
        await updateTransaction(id, formData)
      } else {
        await createTransaction(formData)
      }
      navigate('/transactions')
    } catch (error) {
      console.error('Error saving transaction:', error)
      alert(error.response?.data?.message || 'Error saving transaction')
    } finally {
      setLoading(false)
    }
  }

  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other Income']
  const expenseCategories = ['Food', 'Rent', 'Utilities', 'Transportation', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Travel', 'Bills', 'Other Expense']

  return (
    <div className="transaction-form-page">
      <Sidebar />
      <div className="page-content">
        <div className="form-container">
        <h1>{isEdit ? 'Edit Transaction' : 'Add New Transaction'}</h1>
        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="form-group">
            <label>Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
              required
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="form-group">
            <label>Amount *</label>
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
            <label>Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select category</option>
              {formData.type === 'income'
                ? incomeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)
                : expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)
              }
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add a description..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              />
              Recurring Transaction
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/transactions')} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}

export default TransactionForm

