import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm font-medium">Verifying authentication...</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;