import { Link, useNavigate } from 'react-router-dom';

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="app-main flex items-center justify-center p-6">
      <div className="card w-full max-w-[480px] p-10 text-center">
        <h1 className="text-display-lg text-primary mb-4">403</h1>
        <h2 className="text-h2 text-secondary mb-6">Access Forbidden</h2>
        <p className="text-body-lg text-tertiary mb-10">
          You don't have permission to view this page. If you believe this is an error, please contact your mentor.
        </p>
        
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            Go Back
          </button>
          <Link to="/" className="btn-primary">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
