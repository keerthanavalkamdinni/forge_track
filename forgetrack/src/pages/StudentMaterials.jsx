export default function StudentMaterials() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h1 text-primary">Study Materials</h1>
        <p className="text-body-lg text-secondary mt-1">Access all class recordings and slides.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card space-y-4">
          <div className="text-caption text-tertiary">15 Oct 2025</div>
          <h3 className="text-h3 text-primary">Advanced RAG Strategies</h3>
          <div className="flex flex-col gap-2 pt-4 border-t border-subtle">
            <a href="#" className="text-body text-info-fg hover:underline flex items-center gap-2">
              Slides
            </a>
            <a href="#" className="text-body text-info-fg hover:underline flex items-center gap-2">
              Recording
            </a>
          </div>
        </div>
        
        <div className="card space-y-4">
          <div className="text-caption text-tertiary">13 Oct 2025</div>
          <h3 className="text-h3 text-primary">Fine-tuning Fundamentals</h3>
          <div className="flex flex-col gap-2 pt-4 border-t border-subtle">
            <a href="#" className="text-body text-info-fg hover:underline flex items-center gap-2">
              Slides
            </a>
            <a href="#" className="text-body text-info-fg hover:underline flex items-center gap-2">
              Recording
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
