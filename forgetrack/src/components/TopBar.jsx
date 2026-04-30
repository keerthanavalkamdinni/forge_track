import { useLocation } from 'react-router-dom';

export default function TopBar() {
  const location = useLocation();
  
  // Very simple breadcrumb generator
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pageName = pathParts.length > 0 
    ? pathParts[pathParts.length - 1].replace('-', ' ') 
    : 'Overview';

  return (
    <header className="h-20 flex items-center justify-between px-6 md:px-12">
      <div className="flex items-center gap-2 text-body-sm">
        <span className="text-tertiary">Overview</span>
        <span className="text-tertiary">/</span>
        <span className="text-primary capitalize">{pageName}</span>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Placeholder for Search & Profile */}
        <div className="hidden md:block">
          <input 
            type="text" 
            placeholder="Search students..." 
            className="input w-64 h-9 text-body-sm"
          />
        </div>
        <div className="w-9 h-9 rounded-full bg-surface-raised border border-subtle flex items-center justify-center text-body font-medium">
          U
        </div>
      </div>
    </header>
  );
}
