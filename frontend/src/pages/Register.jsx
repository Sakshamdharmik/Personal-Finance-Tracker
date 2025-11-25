import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/api'
import './Register.css'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
  })
  const [avatar, setAvatar] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [coverImagePreview, setCoverImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const data = new FormData()
      data.append('fullName', formData.fullName)
      data.append('email', formData.email)
      data.append('username', formData.username)
      data.append('password', formData.password)
      if (avatar) {
        data.append('avatar', avatar)
      }
      if (coverImage) {
        data.append('coverImage', coverImage)
      }

      const response = await registerUser(data)
      setSuccess('Registration successful! Redirecting to login...')
      
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join us and start your journey</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>✅</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a password"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="avatar">Avatar (Optional)</label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                className="file-input"
              />
              <label htmlFor="avatar" className="file-label">
                {avatar ? 'Change Avatar' : 'Choose Avatar'}
              </label>
              {avatarPreview && (
                <div className="image-preview">
                  <img src={avatarPreview} alt="Avatar preview" />
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="coverImage">Cover Image (Optional)</label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="coverImage"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="file-input"
              />
              <label htmlFor="coverImage" className="file-label">
                {coverImage ? 'Change Cover Image' : 'Choose Cover Image'}
              </label>
              {coverImagePreview && (
                <div className="image-preview">
                  <img src={coverImagePreview} alt="Cover preview" />
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
