import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function RoleGuard({ allowedRoles }) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    async function checkRole() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          if (mounted) {
            setRole(null);
            setLoading(false);
          }
          return;
        }

        // Fetch user role from public.users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        
        if (mounted) {
          setRole(userData?.role || null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching role:', err);
        if (mounted) {
          setRole(null);
          setLoading(false);
        }
      }
    }

    checkRole();

    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-secondary text-body-lg">Authenticating...</div>
      </div>
    );
  }

  if (!role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet context={{ role }} />;
}
