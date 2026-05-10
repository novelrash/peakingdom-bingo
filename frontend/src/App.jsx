import { Navigate, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Feed from './pages/Feed'
import Tiles from './pages/Tiles'
import TeamPage from './pages/TeamPage'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/leaderboard" element={<Navigate to="/feed" replace />} />
      <Route path="/tiles" element={<Tiles />} />
      <Route path="/team/:teamId" element={<TeamPage />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    </Routes>
  )
}
