import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Plus, ExternalLink, Video, FileText } from 'lucide-react';

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    session_id: '',
    title: '',
    type: 'slides',
    url: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [materialsRes, sessionsRes] = await Promise.all([
      supabase.from('materials').select('*, sessions(date, topic)').order('created_at', { ascending: false }),
      supabase.from('sessions').select('*').order('date', { ascending: false })
    ]);
    
    if (materialsRes.data) setMaterials(materialsRes.data);
    if (sessionsRes.data) {
      setSessions(sessionsRes.data);
      if (sessionsRes.data.length > 0) {
        setFormData(prev => ({ ...prev, session_id: sessionsRes.data[0].id }));
      }
    }
    setLoading(false);
  }

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await supabase.from('materials').insert([formData]);
    
    if (error) {
      console.error("Error adding material:", error);
      alert("Failed to add material");
    } else {
      setShowModal(false);
      setFormData({ ...formData, title: '', url: '', description: '' });
      fetchData(); // reload
    }
    setSaving(false);
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-h1 text-primary">Materials Library</h1>
          <p className="text-body-lg text-secondary mt-1">Manage and upload class materials.</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Material
        </button>
      </div>

      {loading ? (
        <div className="text-secondary text-center py-12">Loading materials...</div>
      ) : materials.length === 0 ? (
        <div className="card text-center py-12 text-secondary">
          No materials have been added yet.
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

      {/* Modal for adding material */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background bg-opacity-80 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-tertiary hover:text-primary transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-h2 text-primary mb-6">Add Material</h2>
            
            <form onSubmit={handleAddMaterial} className="space-y-4">
              <div>
                <label className="text-label text-secondary block mb-1">SESSION</label>
                <select 
                  className="input w-full" 
                  value={formData.session_id}
                  onChange={(e) => setFormData({...formData, session_id: e.target.value})}
                  required
                >
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>{s.date} - {s.topic}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-label text-secondary block mb-1">TITLE</label>
                <input 
                  type="text" 
                  className="input w-full" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Advanced RAG Slides"
                  required
                />
              </div>

              <div>
                <label className="text-label text-secondary block mb-1">TYPE</label>
                <select 
                  className="input w-full"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="slides">Slides</option>
                  <option value="recording">Recording</option>
                  <option value="document">Document</option>
                  <option value="code">Code/Repo</option>
                </select>
              </div>

              <div>
                <label className="text-label text-secondary block mb-1">URL LINK</label>
                <input 
                  type="url" 
                  className="input w-full" 
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  placeholder="https://..."
                  required
                />
              </div>

              <div>
                <label className="text-label text-secondary block mb-1">DESCRIPTION (Optional)</label>
                <textarea 
                  className="input w-full min-h-[80px] py-2" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief context about this material..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? 'Saving...' : 'Add Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
