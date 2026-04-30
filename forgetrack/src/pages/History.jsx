import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search } from 'lucide-react';

export default function History() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('students').select('*').order('name');
      setStudents(data || []);
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h1 text-primary">Student History</h1>
        <p className="text-body-lg text-secondary mt-1">View detailed attendance records per student.</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3 text-tertiary" size={20} />
        <select 
          className="input pl-12 h-12 text-body-lg appearance-none bg-surface-raised w-full max-w-xl"
          onChange={(e) => setSelected(students.find(s => s.id === parseInt(e.target.value)))}
          defaultValue=""
        >
          <option value="" disabled>Select a student...</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.usn})</option>)}
        </select>
      </div>

      {selected ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card lg:col-span-1 space-y-6">
            <h2 className="text-display-sm">{selected.name}</h2>
            <div className="space-y-2">
              <div className="text-body text-secondary font-mono">{selected.usn}</div>
              <div className="text-body text-secondary">Branch: {selected.branch_code}</div>
            </div>
            <div className="pt-6 border-t border-subtle">
              <span className="text-label text-tertiary block mb-2">OVERALL ATTENDANCE</span>
              <div className="text-display-md text-success-fg">82%</div>
            </div>
          </div>
          
          <div className="card lg:col-span-2">
            <span className="text-label text-tertiary block mb-4">ATTENDANCE HEATMAP</span>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 30 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`aspect-square rounded-md border ${
                    Math.random() > 0.2 
                      ? 'bg-success-bg border-success-border' 
                      : 'bg-danger-bg border-danger-border'
                  }`} 
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card py-20 text-center">
          <Users size={48} className="mx-auto text-tertiary mb-4 opacity-50" />
          <h3 className="text-h3 text-secondary">No student selected</h3>
          <p className="text-body text-tertiary mt-2">Use the dropdown above to select a student.</p>
        </div>
      )}
    </div>
  );
}

// Dummy icon for empty state
const Users = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
