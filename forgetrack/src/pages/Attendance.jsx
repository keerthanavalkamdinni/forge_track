import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Attendance() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      const { data } = await supabase.from('students').select('*').eq('is_active', true).order('name');
      setStudents(data || []);
      setLoading(false);
    }
    loadStudents();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h1 text-primary">Mark Attendance</h1>
        <p className="text-body-lg text-secondary mt-1">Select a date and record attendance.</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-subtle">
          <div>
            <label className="text-label text-secondary block mb-2">SESSION DATE</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="input w-48"
            />
          </div>
          <div className="flex-1" />
          <button className="btn-secondary">Select All Present</button>
          <button className="btn-secondary">Select All Absent</button>
        </div>

        {loading ? (
          <div className="text-secondary py-10 text-center">Loading students...</div>
        ) : (
          <div className="space-y-0">
            {students.map((student) => (
              <div key={student.id} className="flex items-center gap-4 py-4 border-b border-subtle last:border-0 hover:bg-surface-raised transition-colors px-4 rounded-lg -mx-4">
                <input type="checkbox" className="w-5 h-5 accent-accent-glow" />
                <div className="flex-1">
                  <div className="text-body-lg text-primary">{student.name}</div>
                  <div className="text-caption font-mono text-tertiary">{student.usn}</div>
                </div>
                <div className="pill bg-surface-inset text-secondary border border-subtle">
                  {student.branch_code}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 md:left-[260px] right-0 bg-surface-raised border-t border-subtle p-4 px-6 md:px-12 flex justify-between items-center z-10 shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
        <div className="text-body text-secondary">
          Ready to mark attendance for <strong className="text-primary">{date}</strong>
        </div>
        <button className="btn-primary">Save Attendance</button>
      </div>
      <div className="h-20" /> {/* Spacer for the fixed bottom bar */}
    </div>
  );
}
