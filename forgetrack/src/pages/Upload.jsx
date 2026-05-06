import { useState, useRef, useEffect } from 'react';
import { Upload as UploadIcon, CheckCircle2, AlertTriangle, XCircle, Settings } from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from '../lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'dummy_key');

export default function Upload() {
  const [step, setStep] = useState(1);
  const fileInputRef = useRef(null);
  
  // Data state
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [dbStudents, setDbStudents] = useState([]);
  
  // Mapping state
  const [mapping, setMapping] = useState({
    student_identifier: '',
    status: '',
    date: new Date().toISOString().split('T')[0] // default to today
  });
  const [aiDetected, setAiDetected] = useState(false);
  const [isMappingLoading, setIsMappingLoading] = useState(false);
  
  // Validation state
  const [validationResults, setValidationResults] = useState({
    ready: [],
    warnings: [],
    errors: []
  });
  
  // Import state
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState({ imported: 0, skipped: 0 });

  useEffect(() => {
    // Load students for validation
    async function loadStudents() {
      const { data } = await supabase.from('students').select('*').eq('is_active', true);
      if (data) setDbStudents(data);
    }
    loadStudents();
  }, []);

  // Step 1: Upload & Parse
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    
    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (results.data.length === 0) {
          alert("CSV is empty");
          return;
        }
        setHeaders(results.meta.fields || []);
        setCsvData(results.data);
        
        // Use AI to suggest mapping
        await suggestMappingWithAI(results.meta.fields, results.data.slice(0, 3));
        setStep(2);
      },
      error: (error) => {
        alert("Error parsing CSV: " + error.message);
      }
    });
  };

  const suggestMappingWithAI = async (fields, sampleData) => {
    setIsMappingLoading(true);
    try {
      if (!import.meta.env.VITE_GEMINI_API_KEY) throw new Error("No API key");
      
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        I have a CSV file for student attendance with the following headers: ${JSON.stringify(fields)}.
        Here is some sample data: ${JSON.stringify(sampleData)}.
        
        Which column represents the student identifier (like name or USN)?
        Which column represents the attendance status (like Present, Absent, P, A)?
        
        Respond ONLY with a JSON object in this exact format:
        {"student_identifier": "column_name", "status": "column_name"}
      `;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const suggestion = JSON.parse(jsonMatch[0]);
        setMapping(prev => ({
          ...prev,
          student_identifier: suggestion.student_identifier || fields[0],
          status: suggestion.status || fields[1]
        }));
        setAiDetected(true);
      }
    } catch (error) {
      console.error("AI Mapping failed:", error);
      // Fallback
      setMapping(prev => ({
        ...prev,
        student_identifier: fields[0] || '',
        status: fields[1] || ''
      }));
    } finally {
      setIsMappingLoading(false);
    }
  };

  // Step 2: Confirm Mapping & Validate
  const handleConfirmMapping = () => {
    if (!mapping.student_identifier || !mapping.status || !mapping.date) {
      alert("Please ensure Student Identifier, Status, and Date are mapped.");
      return;
    }
    
    // Run validation
    const ready = [];
    const warnings = [];
    
    csvData.forEach((row, index) => {
      const idVal = String(row[mapping.student_identifier]).trim().toLowerCase();
      const statusVal = String(row[mapping.status]).trim().toLowerCase();
      
      // Determine if present
      const isPresent = ['p', 'present', 'true', '1', 'yes'].includes(statusVal);
      
      // Try to find student in DB (by USN or Name)
      const matchedStudent = dbStudents.find(
        s => s.usn.toLowerCase() === idVal || s.name.toLowerCase() === idVal
      );
      
      if (matchedStudent) {
        ready.push({
          student_id: matchedStudent.id,
          name: matchedStudent.name,
          usn: matchedStudent.usn,
          present: isPresent,
          original_row: index + 1
        });
      } else {
        warnings.push({
          identifier: row[mapping.student_identifier],
          status: row[mapping.status],
          original_row: index + 1
        });
      }
    });
    
    setValidationResults({ ready, warnings, errors: [] });
    setStep(3);
  };

  // Step 3: Import
  const handleImport = async () => {
    setIsImporting(true);
    try {
      // 1. Ensure session exists
      let sessionId;
      const { data: session } = await supabase.from('sessions').select('*').eq('date', mapping.date).single();
      
      if (session) {
        sessionId = session.id;
      } else {
        const { data: newSession, error: sessionError } = await supabase
          .from('sessions')
          .insert([{ 
            date: mapping.date, 
            topic: `CSV Import Session on ${mapping.date}`, 
            month_number: new Date(mapping.date).getMonth() + 1 
          }])
          .select()
          .single();
          
        if (sessionError) throw sessionError;
        sessionId = newSession.id;
      }
      
      // 2. Prepare attendance records
      const records = validationResults.ready.map(item => ({
        student_id: item.student_id,
        session_id: sessionId,
        present: item.present,
        marked_by: 'ai_import'
      }));
      
      // 3. Upsert attendance
      if (records.length > 0) {
        const { error: upsertError } = await supabase
          .from('attendance')
          .upsert(records, { onConflict: 'student_id,session_id' });
          
        if (upsertError) throw upsertError;
      }
      
      // 4. Log import
      await supabase.from('import_log').insert([{
        filename: file?.name || 'unknown.csv',
        uploaded_by: 'Mentor',
        total_rows: csvData.length,
        imported_rows: records.length,
        skipped_rows: validationResults.warnings.length,
        status: 'completed',
        warnings: JSON.stringify(validationResults.warnings),
        column_mapping: JSON.stringify(mapping)
      }]);
      
      setImportStats({ imported: records.length, skipped: validationResults.warnings.length });
      setStep(4);
    } catch (error) {
      console.error("Import failed:", error);
      alert("Import failed: " + error.message);
    } finally {
      setIsImporting(false);
    }
  };

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
        <div className="absolute left-[12.5%] right-[12.5%] top-4 h-[1px] bg-subtle -z-0" />
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div 
          className="card text-center p-20 border-dashed border-2 border-subtle hover:border-accent-glow hover:bg-accent-glow-soft transition-all cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".csv" 
            onChange={handleFileUpload} 
          />
          <UploadIcon size={48} className="mx-auto text-tertiary mb-4" />
          <h3 className="text-h2 text-primary mb-2">Drop your CSV here</h3>
          <p className="text-body text-secondary">or click to browse from your computer</p>
          <div className="mt-8 text-caption text-tertiary">
            Accepts .csv • Max size 5MB
          </div>
        </div>
      )}

      {/* Step 2: Map Columns */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="card p-6 flex justify-between items-center bg-info-bg border-info-border">
            <div className="flex items-center gap-4">
              {isMappingLoading ? (
                <span className="text-body text-info-fg animate-pulse flex items-center gap-2">
                  <Settings size={18} className="animate-spin" /> AI is analyzing your CSV...
                </span>
              ) : aiDetected ? (
                <>
                  <span className="pill pill-success bg-success-bg text-success-fg border-success-border">AI Detection Complete</span>
                  <span className="text-body text-info-fg">Gemini has suggested a column mapping.</span>
                </>
              ) : (
                <span className="text-body text-info-fg">Please map the columns manually.</span>
              )}
            </div>
          </div>

          <div className="card space-y-6">
            <h3 className="text-h3 text-primary border-b border-subtle pb-4">Mapping Configuration</h3>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="text-label text-secondary block mb-2">SESSION DATE</label>
                <input 
                  type="date" 
                  className="input w-full"
                  value={mapping.date}
                  onChange={(e) => setMapping({...mapping, date: e.target.value})}
                />
                <p className="text-caption text-tertiary mt-1">Which day does this attendance belong to?</p>
              </div>
            </div>
            
            <div className="pt-4">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="text-left py-2 text-label text-secondary">Required Target Field</th>
                    <th className="text-left py-2 text-label text-secondary">Source Column from CSV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle">
                  <tr>
                    <td className="py-4 text-body font-medium text-primary">Student Identifier (Name or USN)</td>
                    <td className="py-4">
                      <select 
                        className="input w-full bg-surface-raised"
                        value={mapping.student_identifier}
                        onChange={(e) => setMapping({...mapping, student_identifier: e.target.value})}
                        disabled={isMappingLoading}
                      >
                        <option value="">-- Select Column --</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 text-body font-medium text-primary">Attendance Status</td>
                    <td className="py-4">
                      <select 
                        className="input w-full bg-surface-raised"
                        value={mapping.status}
                        onChange={(e) => setMapping({...mapping, status: e.target.value})}
                        disabled={isMappingLoading}
                      >
                        <option value="">-- Select Column --</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button className="btn-secondary" onClick={() => setStep(1)}>Cancel</button>
            <button 
              className="btn-primary" 
              onClick={handleConfirmMapping}
              disabled={isMappingLoading || !mapping.student_identifier || !mapping.status}
            >
              Confirm Mapping
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Validate */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="card p-4 flex justify-between items-center">
            <div className="flex gap-6">
              <div className="flex flex-col">
                <span className="text-h2 text-success-fg">{validationResults.ready.length}</span>
                <span className="text-caption text-secondary uppercase tracking-wider">Ready</span>
              </div>
              <div className="flex flex-col">
                <span className="text-h2 text-warning-fg">{validationResults.warnings.length}</span>
                <span className="text-caption text-secondary uppercase tracking-wider">Unmatched</span>
              </div>
            </div>
            <button className="btn-primary" onClick={handleImport} disabled={isImporting}>
              {isImporting ? 'Importing...' : 'Start Import'}
            </button>
          </div>

          {validationResults.warnings.length > 0 && (
            <div className="card p-0 overflow-hidden border-l-4 border-l-warning-border">
              <div className="p-4 bg-warning-bg bg-opacity-10 border-b border-subtle">
                <h4 className="text-body font-medium text-warning-fg flex items-center gap-2">
                  <AlertTriangle size={18} /> The following records could not be matched to a student in the database. They will be skipped.
                </h4>
              </div>
              <div className="max-h-[300px] overflow-y-auto p-4 space-y-3">
                {validationResults.warnings.map((w, i) => (
                  <div key={i} className="flex items-center gap-3 text-body-sm text-secondary bg-surface-raised p-3 rounded-lg border border-subtle">
                    <span className="text-tertiary w-8">#{w.original_row}</span>
                    <span className="font-mono text-primary">{w.identifier}</span>
                    <span className="ml-auto pill bg-surface-inset border-subtle">{w.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-between pt-4">
            <button className="btn-secondary" onClick={() => setStep(2)}>Back to Mapping</button>
          </div>
        </div>
      )}

      {/* Step 4: Complete */}
      {step === 4 && (
        <div className="card text-center p-20 animate-in zoom-in-95 duration-500">
          <CheckCircle2 size={64} className="mx-auto text-success-fg mb-6" />
          <h2 className="text-display-sm text-primary mb-2">Import Successful</h2>
          <p className="text-body-lg text-secondary mb-8">
            Successfully imported {importStats.imported} attendance records for {mapping.date}.
            {importStats.skipped > 0 && ` (${importStats.skipped} skipped)`}
          </p>
          <button className="btn-secondary" onClick={() => {
            setFile(null);
            setCsvData([]);
            setStep(1);
          }}>Upload Another File</button>
        </div>
      )}
    </div>
  );
}
