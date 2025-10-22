const API_BASE_URL = 'http://localhost:4000/api/auth';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  user?: any;
}

class AuthService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include', // Important for cookies
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw data;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Public verification flow (no auth cookie required)
  async sendVerifyOtpPublic(email: string): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/send-verify-otp-public', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyEmailPublic(email: string, otp: string): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/verify-email-public', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async login(credentials: LoginRequest): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/logout', {
      method: 'POST',
    });
  }

  async sendVerifyOtp(): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/send-verify-otp', {
      method: 'POST',
    });
  }

  async verifyEmail(otpData: VerifyEmailRequest): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/verify-email', {
      method: 'POST',
      body: JSON.stringify(otpData),
    });
  }

  async isAuthenticated(): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/is-auth', {
      method: 'POST',
    });
  }

  async sendResetOtp(email: string): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/send-reset-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(resetData: ResetPasswordRequest): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/reset-password', {
      method: 'POST',
      body: JSON.stringify(resetData),
    });
  }
}

export const authService = new AuthService();

