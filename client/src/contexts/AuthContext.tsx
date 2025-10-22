import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, RegisterRequest, LoginRequest, VerifyEmailRequest, ResetPasswordRequest, ApiResponse } from '../services/authService';

interface User {
  _id: string;
  name: string;
  email: string;
  isAccountVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (userData: RegisterRequest) => Promise<ApiResponse>;
  signIn: (credentials: LoginRequest) => Promise<ApiResponse>;
  signOut: () => Promise<ApiResponse>;
  sendVerifyOtp: () => Promise<ApiResponse>;
  verifyEmail: (otpData: VerifyEmailRequest) => Promise<ApiResponse>;
  sendVerifyOtpPublic: (email: string) => Promise<ApiResponse>;
  verifyEmailPublic: (email: string, otp: string) => Promise<ApiResponse>;
  sendResetOtp: (email: string) => Promise<ApiResponse>;
  resetPassword: (resetData: ResetPasswordRequest) => Promise<ApiResponse>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await authService.isAuthenticated();
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: RegisterRequest): Promise<ApiResponse> => {
    try {
      const response = await authService.register(userData);
      // Do NOT call checkAuth here so that user stays logged out after register
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (credentials: LoginRequest): Promise<ApiResponse> => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        // After successful login, check auth to get user data
        await checkAuth();
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async (): Promise<ApiResponse> => {
    try {
      const response = await authService.logout();
      setUser(null);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const sendVerifyOtp = async (): Promise<ApiResponse> => {
    return authService.sendVerifyOtp();
  };

  const sendVerifyOtpPublic = async (email: string): Promise<ApiResponse> => {
    return authService.sendVerifyOtpPublic(email);
  };

  const verifyEmail = async (otpData: VerifyEmailRequest): Promise<ApiResponse> => {
    try {
      const response = await authService.verifyEmail(otpData);
      if (response.success) {
        // Update user verification status
        await checkAuth();
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const verifyEmailPublic = async (email: string, otp: string): Promise<ApiResponse> => {
    return authService.verifyEmailPublic(email, otp);
  };

  const sendResetOtp = async (email: string): Promise<ApiResponse> => {
    return authService.sendResetOtp(email);
  };

  const resetPassword = async (resetData: ResetPasswordRequest): Promise<ApiResponse> => {
    return authService.resetPassword(resetData);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signUp, 
      signIn, 
      signOut, 
      sendVerifyOtp, 
      verifyEmail, 
      sendVerifyOtpPublic,
      verifyEmailPublic,
      sendResetOtp, 
      resetPassword, 
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
