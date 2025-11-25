import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Sidebar.css'

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const menuItems = [
    { path: '/dashboard', label: '📊 Dashboard', icon: '📊' },
    { path: '/transactions', label: '💸 Transactions', icon: '💸' },
    { path: '/budgets', label: '💵 Budgets', icon: '💵' },
  ]

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(path)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="brand">
          <span className="brand-icon">💰</span>
          <h2>Finance Tracker</h2>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="user-avatar" />
          ) : (
            <div className="user-avatar-placeholder">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="user-details">
            <p className="user-name">{user?.fullName || 'User'}</p>
            <p className="user-email">{user?.email || ''}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar

