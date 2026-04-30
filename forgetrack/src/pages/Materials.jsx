export default function Materials() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-h1 text-primary">Materials Library</h1>
          <p className="text-body-lg text-secondary mt-1">Access all class recordings and slides.</p>
        </div>
        <button className="btn-primary">Add Material</button>
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
      </div>
    </div>
  );
}
