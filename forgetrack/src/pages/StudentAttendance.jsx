import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function StudentAttendance() {
  const [data, setData] = useState({
    name: 'Student Name',
    usn: 'USN',
    branch: 'CS',
    attendance: 85
  });

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-display-lg text-primary">{data.name}</h1>
        <div className="text-body-lg text-tertiary mt-2 flex items-center gap-2">
          <span className="font-mono">{data.usn}</span>
          <span>•</span>
          <span>{data.branch}</span>
          <span>•</span>
          <span>Batch 2024-2028</span>
        </div>
      </div>

      {/* Main Stats */}
      <div className="card text-center py-16 bg-surface">
        <span className="text-label text-tertiary block mb-4">OVERALL ATTENDANCE</span>
        <div className="text-display-hero text-success-fg mb-4">{data.attendance}%</div>
        <p className="text-body-lg text-secondary">24 of 28 sessions attended</p>
      </div>

      {/* Heatmap */}
      <div className="card space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-h2">Attendance Heatmap</h2>
          <select className="input w-32 h-9 py-1 text-body-sm bg-surface-raised">
            <option>Month 4</option>
            <option>Month 5</option>
          </select>
        </div>
        <div className="grid grid-cols-7 gap-2 md:gap-4">
          {Array.from({ length: 30 }).map((_, i) => (
            <div 
              key={i} 
              className={`aspect-square rounded-[10px] border flex items-center justify-center text-caption ${
                Math.random() > 0.15 
                  ? 'bg-success-bg border-success-border text-success-fg' 
                  : 'bg-danger-bg border-danger-border text-danger-fg'
              }`} 
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
