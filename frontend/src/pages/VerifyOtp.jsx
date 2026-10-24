import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { KeyRound, Loader2, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  
  // Loading states for buttons
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  
  const [timer, setTimer] = useState(30); // 30-second resend clock
  
  const mobile = localStorage.getItem('temp_mobile');
  const navigate = useNavigate();

  // Guard block
  useEffect(() => {
    if (!mobile) {
      navigate('/login');
    }
  }, [mobile, navigate]);

  // Interval timer for resend
  useEffect(() => {
    if (timer > 0) {
      const intervalId = window.setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => window.clearInterval(intervalId);
    }
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setLoading(true);

    try {
      const response = await authService.verifyOtp(mobile, otp);
      
      if (response.data.success) {
        toast.success('Successfully Authenticated!', {
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
        });
        localStorage.setItem('token', response.data.data);
        localStorage.removeItem('temp_mobile'); 
        
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return; 
    
    setResending(true);
    
    try {
      const response = await authService.resendOtp(mobile);
      if (response.data.success) {
        toast.success('A new OTP has been sent via SMS!');
        setTimer(30); // reset lockout
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 border border-slate-100/60 transform transition-all">
        
        {/* Dynamic Verification Header */}
        <div className="text-center mb-10">
          <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-blue-50/50">
            <KeyRound className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Verify Secure Code</h2>
          <p className="mt-3 text-base text-slate-500">
            Enter the 6-digit code sent to <br /><span className="font-bold text-slate-800 text-lg mt-1 inline-block">+91 {mobile}</span>
          </p>
        </div>

        {/* Verification Trigger */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">One Time Password</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="block w-full px-4 py-4 border border-slate-200 rounded-xl text-center tracking-[1.5em] text-3xl font-black text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder-slate-200"
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-md text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Confirm & Proceed'}
          </button>
        </form>

        {/* Resend Block with Timer Output */}
        <div className="mt-8 text-center pt-6 border-t border-slate-100/80">
          {timer > 0 ? (
            <p className="text-sm font-medium text-slate-500 flex items-center justify-center bg-slate-50 py-2.5 rounded-lg border border-slate-100">
              <Clock className="w-4 h-4 mr-2 text-slate-400" />
              Resend code in <strong className="ml-1 text-slate-800">00:{timer < 10 ? `0${timer}` : timer}</strong>
            </p>
          ) : (
            <button
              onClick={handleResendOtp}
              disabled={resending}
              className="w-full py-2.5 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 focus:outline-none disabled:opacity-50 inline-flex items-center justify-center transition-all bg-transparent"
            >
              {resending ? (
                <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Requesting SMS...</>
              ) : (
                "Didn't receive the code? Resend SMS"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
