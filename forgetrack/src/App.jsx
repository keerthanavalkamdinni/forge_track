import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import RoleGuard from './components/RoleGuard';
import Layout from './components/Layout';
import Login from './pages/Login';
import Forbidden from './pages/Forbidden';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import History from './pages/History';
import Materials from './pages/Materials';
import DevTokens from './pages/DevTokens';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/403" element={<Forbidden />} />
        <Route path="/dev-tokens" element={<DevTokens />} />

        {/* Mentor Routes */}
        <Route element={<RoleGuard allowedRoles={['mentor']} />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/history" element={<History />} />
            <Route path="/materials" element={<Materials />} />
          </Route>
        </Route>
        
        {/* Student Routes */}
        <Route element={<RoleGuard allowedRoles={['student']} />}>
          <Route element={<Layout />}>
            <Route path="/me" element={<Navigate to="/me/attendance" replace />} />
            <Route path="/me/attendance" element={<div className="p-8"><h1 className="text-display-md text-primary">Student Attendance</h1></div>} />
            <Route path="/me/upcoming" element={<div className="p-8"><h1 className="text-display-md text-primary">Upcoming</h1></div>} />
            <Route path="/me/materials" element={<div className="p-8"><h1 className="text-display-md text-primary">Student Materials</h1></div>} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
