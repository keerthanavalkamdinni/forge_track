import { useLocation, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, BookOpen, Upload, UserCheck, Calendar, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Sidebar({ role }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname.startsWith(to) && (to !== '/' || location.pathname === '/');
    
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 h-[44px] rounded-[14px] transition-colors ${
          isActive 
            ? 'bg-surface-raised text-primary shadow-[inset_2px_0_0_0_var(--accent-glow)]' 
            : 'text-secondary hover:bg-surface'
        }`}
      >
        <Icon size={20} strokeWidth={1.75} />
        <span className="text-body font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <aside className="w-[260px] h-screen fixed left-0 top-0 border-r border-subtle bg-canvas hidden md:flex flex-col">
      <div className="h-20 flex items-center px-6">
        <h1 className="text-h2 text-primary tracking-tight">ForgeTrack</h1>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto space-y-8">
        {role === 'mentor' && (
          <>
            <div>
              <div className="text-label text-tertiary mb-3 px-4">OVERVIEW</div>
              <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            </div>
            
            <div className="space-y-1">
              <div className="text-label text-tertiary mb-3 px-4 mt-6">ACTIVITY</div>
              <NavItem to="/attendance" icon={CheckSquare} label="Mark Attendance" />
              <NavItem to="/history" icon={Users} label="Student History" />
              <NavItem to="/materials" icon={BookOpen} label="Materials" />
            </div>

            <div className="space-y-1">
              <div className="text-label text-tertiary mb-3 px-4 mt-6">DATA</div>
              <NavItem to="/upload" icon={Upload} label="Upload CSV" />
            </div>
          </>
        )}

        {role === 'student' && (
          <div className="space-y-1">
            <div className="text-label text-tertiary mb-3 px-4">YOUR PORTAL</div>
            <NavItem to="/me/attendance" icon={UserCheck} label="My Attendance" />
            <NavItem to="/me/upcoming" icon={Calendar} label="Upcoming" />
            <NavItem to="/me/materials" icon={BookOpen} label="Materials" />
          </div>
        )}
      </div>

      <div className="p-4 border-t border-subtle">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 h-[44px] rounded-[14px] text-secondary hover:bg-surface transition-colors"
        >
          <LogOut size={20} strokeWidth={1.75} />
          <span className="text-body font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
