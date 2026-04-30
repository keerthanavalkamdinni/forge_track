import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function DevTokens() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-8 lg:px-12 py-12">
      <div className="mb-12">
        <span className="text-label text-tertiary block mb-2">DESIGN SYSTEM VERIFICATION</span>
        <h1 className="text-display-lg mb-4">Dev Tokens</h1>
        <p className="text-body-lg text-secondary max-w-2xl">
          This is a throwaway page to verify that the Tailwind configuration, 
          CSS custom properties, and base fonts are working correctly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Card Component */}
        <div className="card space-y-6">
          <div>
            <span className="text-label text-tertiary block mb-2">COMPONENT</span>
            <h2 className="text-h2">Glass Card</h2>
          </div>
          
          <p className="text-body text-secondary">
            Notice the subtle border, inner gradient highlight, and proper padding.
          </p>

          {/* Typography Check inside card */}
          <div className="space-y-4 pt-4 border-t border-subtle">
            <div>
              <div className="text-micro text-tertiary mb-1">text-display-md tabular-nums</div>
              <div className="text-display-md tabular-nums">$104,347.43</div>
            </div>
            <div>
              <div className="text-micro text-tertiary mb-1">text-body + mono</div>
              <div className="text-body">USN: <span className="font-mono text-tertiary">4SH24CS001</span></div>
            </div>
          </div>
        </div>

        {/* Form Controls Component */}
        <div className="card space-y-8">
          <div>
            <span className="text-label text-tertiary block mb-2">INTERACTIVE</span>
            <h2 className="text-h2">Form Controls</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-label text-secondary block mb-2">EMAIL ADDRESS</label>
              <input type="email" placeholder="mentor@forge.local" className="input" />
              <p className="text-caption text-tertiary mt-2">Try focusing the input to see the accent glow.</p>
            </div>

            <div className="flex gap-4 pt-4">
              <button className="btn-primary">Primary Action</button>
              <button className="btn-secondary">Secondary</button>
            </div>
          </div>
        </div>

        {/* Status Pills */}
        <div className="card space-y-6 md:col-span-2">
          <div>
            <span className="text-label text-tertiary block mb-2">SEMANTIC</span>
            <h2 className="text-h2">Status Indicators</h2>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <span className="pill pill-success">
              <CheckCircle2 size={14} /> Present
            </span>
            <span className="pill pill-danger">
              <XCircle size={14} /> Absent
            </span>
            <span className="pill" style={{ background: 'var(--warning-bg)', color: 'var(--warning-fg)', borderColor: 'var(--warning-border)' }}>
              <AlertTriangle size={14} /> Warning
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
