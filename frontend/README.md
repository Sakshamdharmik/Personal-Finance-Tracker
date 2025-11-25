# CC Backend Practice - Frontend

A beautiful, modern React frontend application built with Vite that connects to the CC Backend Practice API.

## Features

- ✨ Modern, beautiful UI with gradient designs
- 🔐 User authentication (Register, Login, Logout)
- 📸 Image upload with preview (Avatar & Cover Image)
- 🛡️ Protected routes with JWT authentication
- 🔄 Automatic token refresh
- 📱 Fully responsive design
- ⚡ Fast development with Vite

## Tech Stack

- **React 18** - UI library
- **React Router** - Routing
- **Axios** - HTTP client
- **Vite** - Build tool
- **CSS3** - Styling with CSS variables

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Backend server running on `http://localhost:8000`

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   └── ProtectedRoute.jsx
│   ├── context/         # React Context
│   │   └── AuthContext.jsx
│   ├── pages/          # Page components
│   │   ├── Register.jsx
│   │   ├── Login.jsx
│   │   └── Dashboard.jsx
│   ├── services/       # API services
│   │   └── api.js
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── vite.config.js
└── package.json
```

## API Integration

The frontend connects to the backend API at `http://localhost:8000/api/v1/users`

### Endpoints Used

- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - User logout
- `POST /api/v1/users/refresh-token` - Refresh access token

## Features in Detail

### Authentication Flow

1. **Register**: Users can create an account with avatar and cover image
2. **Login**: Users can login with email/username and password
3. **Token Management**: Tokens are stored in localStorage and automatically refreshed
4. **Protected Routes**: Dashboard is only accessible to authenticated users

### Image Upload

- Avatar is required during registration
- Cover image is optional
- Image preview before upload
- Images are uploaded to Cloudinary via backend

## Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Environment Variables

The frontend is configured to connect to `http://localhost:8000` by default. To change this, update the `API_BASE_URL` in `src/services/api.js`.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
