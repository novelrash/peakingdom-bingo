import { Navigate, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Feed from './pages/Feed'
import Gallery from './pages/Gallery'
import LeaderboardPage from './pages/LeaderboardPage'
import Tiles from './pages/Tiles'
import TeamPage from './pages/TeamPage'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Setup from './pages/Setup'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/tiles" element={<Tiles />} />
      <Route path="/team/:teamId" element={<TeamPage />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    </Routes>
  )
}
