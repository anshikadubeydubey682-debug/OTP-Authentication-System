import api from './api';

export const authService = {
  /**
   * Register a brand new user
   * @param {Object} data { name: string, mobile: string }
   */
  register: async (data) => {
    return await api.post('/auth/register', data);
  },
  /**
   * Request OTP for a given mobile number
   * @param {string} mobile 10-digit mobile number
   */
  sendOtp: async (mobile) => {
    return await api.post('/auth/send-otp', { mobile });
  },

  /**
   * Verify the 6-digit OTP
   * @param {string} mobile 10-digit mobile number
   * @param {string} otp 6-digit OTP
   */
  verifyOtp: async (mobile, otp) => {
    return await api.post('/auth/verify-otp', { mobile, otp });
  },

  /**
   * Resend OTP for a given mobile number
   * @param {string} mobile 10-digit mobile number
   */
  resendOtp: async (mobile) => {
    return await api.post('/auth/resend-otp', { mobile });
  },

  /**
   * Fetch currently authenticated user profile
   */
  getCurrentUser: async () => {
    return await api.get('/auth/me');
  }
};
