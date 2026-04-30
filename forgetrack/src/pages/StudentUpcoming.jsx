import { Calendar } from 'lucide-react';

export default function StudentUpcoming() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h1 text-primary">Upcoming Sessions</h1>
        <p className="text-body-lg text-secondary mt-1">See what is scheduled next.</p>
      </div>

      <div className="card p-10 bg-accent-glow-soft border-accent-glow border-opacity-30">
        <span className="text-label text-accent-glow block mb-4">NEXT SESSION</span>
        <h2 className="text-display-sm text-primary mb-2">Capstone Project Kickoff</h2>
        <div className="flex gap-6 mt-6">
          <div className="flex items-center gap-2 text-body-lg text-secondary">
            <Calendar size={20} />
            20 Oct 2025
          </div>
          <div className="pill border border-subtle">Offline</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-subtle">
        <div className="space-y-4">
          <h3 className="text-h3 text-tertiary uppercase tracking-wider mb-6">Past Sessions</h3>
          <div className="flex gap-4 p-4 rounded-xl border border-subtle opacity-70">
            <div className="text-body text-secondary font-mono">15 Oct</div>
            <div className="text-body text-primary">Advanced RAG Strategies</div>
          </div>
          <div className="flex gap-4 p-4 rounded-xl border border-subtle opacity-70">
            <div className="text-body text-secondary font-mono">13 Oct</div>
            <div className="text-body text-primary">Fine-tuning Fundamentals</div>
          </div>
        </div>
      </div>
    </div>
  );
}
