import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { ShieldCheck, LogOut, Loader2, Smartphone, User } from 'lucide-react';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 2. Fetch authenticated user data
    const fetchUser = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (err) {
        // Force logout if token is expired or unauthorized
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // 3. Logout Functionality
  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the JWT Token
    navigate('/login');               // Redirect to Login
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* Navbar with Logout */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-slate-800 flex items-center">
              <ShieldCheck className="w-6 h-6 text-blue-600 mr-2" />
              SecureAuth
            </h1>
            <button 
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-lg text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100 p-8 text-center">
          
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <ShieldCheck className="h-12 w-12 text-green-600" />
          </div>
          
          <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Login Successful!</h2>
          <p className="text-lg text-slate-500 mb-8">You have securely authenticated into your dashboard.</p>
          
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 inline-block min-w-[320px] text-left shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Verified Account Details</h3>
            
            {user?.name && (
              <div className="flex items-center text-slate-700 mb-4">
                <User className="w-5 h-5 mr-3 text-slate-400" />
                <span className="font-medium text-sm">Full Name:</span>
                <span className="ml-auto font-bold text-slate-900">{user.name}</span>
              </div>
            )}
            
            <div className="flex items-center text-slate-700">
               <Smartphone className="w-5 h-5 mr-3 text-slate-400" />
               <span className="font-medium text-sm">Mobile Number:</span>
               <span className="ml-auto font-bold text-slate-900">{user?.mobile || 'Loading...'}</span>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
