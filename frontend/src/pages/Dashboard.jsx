import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <h2>CC Backend Practice</h2>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card">
          <div className="welcome-header">
            <h1>Welcome, {user?.fullName || 'User'}! 👋</h1>
            <p>You're successfully logged in</p>
          </div>

          <div className="user-profile">
            <div className="profile-header">
              {user?.coverImage && (
                <div className="cover-image">
                  <img src={user.coverImage} alt="Cover" />
                </div>
              )}
              <div className="avatar-section">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="avatar" />
                ) : (
                  <div className="avatar avatar-placeholder">
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </div>

            <div className="profile-info">
              <div className="info-card">
                <div className="info-label">Full Name</div>
                <div className="info-value">{user?.fullName}</div>
              </div>

              <div className="info-card">
                <div className="info-label">Username</div>
                <div className="info-value">@{user?.username}</div>
              </div>

              <div className="info-card">
                <div className="info-label">Email</div>
                <div className="info-value">{user?.email}</div>
              </div>

              <div className="info-card">
                <div className="info-label">User ID</div>
                <div className="info-value">{user?._id}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Secure Authentication</h3>
            <p>JWT tokens with refresh mechanism</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">☁️</div>
            <h3>Cloud Storage</h3>
            <p>Images stored on Cloudinary</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast & Responsive</h3>
            <p>Modern React with Vite</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Beautiful UI</h3>
            <p>Modern design with gradients</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
