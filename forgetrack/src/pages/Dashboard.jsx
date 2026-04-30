import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Users, Activity, Clock } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState({
    sessions: 0,
    attendanceRate: 0,
    activeStudents: 0,
    lastSession: '—'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const { count: sessionCount } = await supabase.from('sessions').select('*', { count: 'exact', head: true });
        const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('is_active', true);
        
        const { data: lastSessionData } = await supabase.from('sessions').select('date').order('date', { ascending: false }).limit(1).single();
        
        setData({
          sessions: sessionCount || 0,
          activeStudents: studentCount || 0,
          attendanceRate: 85, // Placeholder
          lastSession: lastSessionData?.date || '—'
        });
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section>
        <h1 className="text-display-hero text-primary">Welcome Back, Mentor</h1>
        <p className="text-body-lg text-secondary mt-2">Here is what's happening today.</p>
      </section>

      {/* Ticker Strip */}
      <section className="flex gap-8 overflow-x-auto pb-4 border-b border-subtle">
        <div className="flex items-center gap-3">
          <Calendar size={16} className="text-secondary" />
          <div className="flex flex-col">
            <span className="text-caption text-tertiary uppercase">Total Sessions</span>
            <span className="text-body-lg font-semibold tabular-nums">{loading ? '-' : data.sessions}</span>
          </div>
        </div>
        <div className="w-[1px] h-8 bg-subtle" />
        <div className="flex items-center gap-3">
          <Activity size={16} className="text-secondary" />
          <div className="flex flex-col">
            <span className="text-caption text-tertiary uppercase">Overall Attendance</span>
            <span className="text-body-lg font-semibold tabular-nums">{loading ? '-' : `${data.attendanceRate}%`}</span>
          </div>
        </div>
        <div className="w-[1px] h-8 bg-subtle" />
        <div className="flex items-center gap-3">
          <Users size={16} className="text-secondary" />
          <div className="flex flex-col">
            <span className="text-caption text-tertiary uppercase">Active Students</span>
            <span className="text-body-lg font-semibold tabular-nums">{loading ? '-' : data.activeStudents}</span>
          </div>
        </div>
        <div className="w-[1px] h-8 bg-subtle" />
        <div className="flex items-center gap-3">
          <Clock size={16} className="text-secondary" />
          <div className="flex flex-col">
            <span className="text-caption text-tertiary uppercase">Last Session</span>
            <span className="text-body-lg font-semibold tabular-nums">{loading ? '-' : data.lastSession}</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Session */}
        <div className="card rounded-[24px] p-10 space-y-6">
          <div>
            <span className="text-label text-tertiary block mb-2">TODAY'S SESSION</span>
            <h2 className="text-display-sm text-primary">No session scheduled</h2>
          </div>
          <p className="text-body text-secondary">
            There is no session in the database for today. You can create one to mark attendance.
          </p>
          <button className="btn-primary">Create Session</button>
        </div>

        {/* Program Overview */}
        <div className="card rounded-[24px] p-10 space-y-6">
          <div>
            <span className="text-label text-tertiary block mb-2">OVERVIEW</span>
            <h2 className="text-display-sm text-primary">Program Health</h2>
          </div>
          <div className="space-y-4 pt-4">
            <div className="flex justify-between items-center border-b border-subtle pb-4">
              <span className="text-body text-secondary">Highest Attendance</span>
              <span className="text-body-lg text-primary tabular-nums">Vihaan Kumar</span>
            </div>
            <div className="flex justify-between items-center pb-4">
              <span className="text-body text-secondary">Lowest Attendance</span>
              <span className="text-body-lg text-primary tabular-nums">Aarav Patel</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
