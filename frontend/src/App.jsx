import { Navigate, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Tiles from './pages/Tiles'
import LeaderboardPage from './pages/LeaderboardPage'
import TeamPage from './pages/TeamPage'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/tiles" element={<Tiles />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/team/:teamId" element={<TeamPage />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    </Routes>
  )
}
