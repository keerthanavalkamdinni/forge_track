import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ExternalLink, Video, FileText } from 'lucide-react';

export default function StudentMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMaterials() {
      const { data } = await supabase
        .from('materials')
        .select('*, sessions(date, topic)')
        .order('created_at', { ascending: false });
      
      if (data) setMaterials(data);
      setLoading(false);
    }
    fetchMaterials();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h1 text-primary">Study Materials</h1>
        <p className="text-body-lg text-secondary mt-1">Access all class recordings and slides.</p>
      </div>

      {loading ? (
        <div className="text-secondary text-center py-12">Loading materials...</div>
      ) : materials.length === 0 ? (
        <div className="card text-center py-12 text-secondary">
          No materials have been uploaded yet. Check back later!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((mat) => (
            <div key={mat.id} className="card space-y-4 hover:border-accent-glow transition-all">
              <div className="flex justify-between items-start">
                <div className="text-caption text-tertiary">
                  {mat.sessions?.date ? new Date(mat.sessions.date).toLocaleDateString() : 'No Date'}
                </div>
                <div className="pill bg-surface-inset text-secondary border border-subtle">
                  {mat.type === 'recording' ? <Video size={14} className="inline mr-1"/> : <FileText size={14} className="inline mr-1"/>}
                  {mat.type}
                </div>
              </div>
              <h3 className="text-h3 text-primary line-clamp-2" title={mat.title}>{mat.title}</h3>
              {mat.sessions?.topic && (
                <div className="text-body-sm text-secondary line-clamp-1" title={mat.sessions.topic}>
                  Session: {mat.sessions.topic}
                </div>
              )}
              {mat.description && (
                <div className="text-body text-secondary line-clamp-2 text-sm">{mat.description}</div>
              )}
              <div className="pt-4 border-t border-subtle">
                <a href={mat.url} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full flex justify-center items-center gap-2">
                  Open Link <ExternalLink size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
