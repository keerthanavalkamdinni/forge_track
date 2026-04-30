import { useState } from 'react';
import { Upload as UploadIcon, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function Upload() {
  const [step, setStep] = useState(1);

  // Mock functions for UI flow
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-h1 text-primary">Upload CSV</h1>
        <p className="text-body-lg text-secondary mt-1">Import attendance from previous months using AI.</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-12">
        {['Upload', 'Map Columns', 'Validate', 'Import'].map((label, i) => {
          const num = i + 1;
          const isActive = step === num;
          const isDone = step > num;
          
          return (
            <div key={label} className="flex flex-col items-center gap-2 relative z-10 w-1/4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium
                ${isActive ? 'bg-accent-glow text-primary' : 
                  isDone ? 'bg-success-bg text-success-fg border border-success-border' : 
                  'bg-surface-raised text-tertiary border border-subtle'}`}
              >
                {isDone ? <CheckCircle2 size={16} /> : num}
              </div>
              <span className={`text-caption ${isActive ? 'text-primary' : 'text-secondary'}`}>
                {label}
              </span>
            </div>
          );
        })}
        {/* Connecting line */}
        <div className="absolute left-[12.5%] right-[12.5%] top-4 h-[1px] bg-subtle -z-0" />
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="card text-center p-20 border-dashed border-2 border-subtle hover:border-accent-glow hover:bg-accent-glow-soft transition-all cursor-pointer">
          <UploadIcon size={48} className="mx-auto text-tertiary mb-4" />
          <h3 className="text-h2 text-primary mb-2">Drop your CSV here</h3>
          <p className="text-body text-secondary">or click to browse from your computer</p>
          <div className="mt-8 text-caption text-tertiary">
            Accepts .csv or .xlsx • Max size 5MB
          </div>
          
          {/* Mock Upload trigger */}
          <button className="btn-primary mt-6" onClick={nextStep}>Simulate Upload</button>
        </div>
      )}

      {/* Step 2: Map Columns */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="card p-6 flex justify-between items-center bg-info-bg border-info-border">
            <div className="flex gap-4">
              <span className="pill pill-success">Detected: Pivoted Format</span>
              <span className="pill pill-success">Date: DD/M/YY</span>
            </div>
            <span className="text-caption text-info-fg">AI Mapping Applied</span>
          </div>

          <div className="card p-0 overflow-hidden">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Source Column</th>
                  <th>Target Field</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>SL No</td>
                  <td>
                    <select className="input h-9 py-1 bg-surface-raised" defaultValue="IGNORE">
                      <option value="IGNORE">IGNORE</option>
                      <option value="student_name">Student Name</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>name</td>
                  <td>
                    <select className="input h-9 py-1 bg-surface-raised" defaultValue="student_name">
                      <option value="student_name">Student Name</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-between">
            <button className="btn-secondary" onClick={prevStep}>Back</button>
            <button className="btn-primary" onClick={nextStep}>Confirm Mapping</button>
          </div>
        </div>
      )}

      {/* Step 3: Validate */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="card p-4 flex justify-between items-center">
            <div className="flex gap-4">
              <span className="text-body font-medium text-success-fg">120 Ready</span>
              <span className="text-body font-medium text-warning-fg">5 Warnings</span>
              <span className="text-body font-medium text-danger-fg">0 Errors</span>
            </div>
            <button className="btn-primary" onClick={nextStep}>Import Records</button>
          </div>

          <div className="card p-0 overflow-hidden border-l-4 border-l-warning-border">
            <div className="p-4 border-b border-subtle bg-warning-bg bg-opacity-20 flex items-start gap-3">
              <AlertTriangle className="text-warning-fg" size={20} />
              <div>
                <div className="text-body font-medium text-primary mb-1">Student not found: "Rahul K"</div>
                <div className="text-body-sm text-secondary">Did you mean:</div>
                <select className="input mt-2 h-9 py-1 w-64 bg-surface-raised">
                  <option>Rahul Kumar (4SH24CS029)</option>
                  <option>Ignore this record</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button className="btn-secondary" onClick={prevStep}>Back</button>
          </div>
        </div>
      )}

      {/* Step 4: Complete */}
      {step === 4 && (
        <div className="card text-center p-20">
          <CheckCircle2 size={64} className="mx-auto text-success-fg mb-6" />
          <h2 className="text-display-sm text-primary mb-2">Import Successful</h2>
          <p className="text-body-lg text-secondary mb-8">
            Successfully imported 125 attendance records.
          </p>
          <button className="btn-secondary" onClick={() => setStep(1)}>Upload Another File</button>
        </div>
      )}
    </div>
  );
}
