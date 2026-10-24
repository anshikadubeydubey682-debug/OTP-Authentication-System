import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Smartphone, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    // Strict 10-digit validation
    if (mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true); // Engages loading animation and disables button
    
    try {
      const response = await authService.sendOtp(mobile);
      
      if (response.data.success) {
        toast.success('OTP sent successfully!');
        localStorage.setItem('temp_mobile', mobile);
        navigate('/verify-otp'); 
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      {/* Container - Fully Responsive & Animated rendering */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 border border-slate-100/60 transform transition-all">
        
        {/* Modern Header UI */}
        <div className="text-center mb-10">
          <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-blue-50/50">
            <ShieldCheck className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h2>
          <p className="mt-3 text-base text-slate-500">Sign in securely with your mobile number</p>
        </div>

        {/* Input Form Setup */}
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Smartphone className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="tel"
                value={mobile}
                // Prevents entering anything except digits, auto-clamps to 10
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900 text-lg tracking-wider placeholder-slate-300 outline-none"
                placeholder="000 000 0000"
              />
            </div>
          </div>

          {/* Premium Interactive Action Button */}
          <button
            type="submit"
            disabled={loading || mobile.length !== 10}
            className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-md text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="animate-spin h-6 w-6" />
            ) : (
              <>
                Send OTP Request <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {/* Navigation Link Added here */}
        <div className="mt-8 text-center pt-2">
          <p className="text-sm font-medium text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-500 font-bold hover:underline transition-all">
              Register securely
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
