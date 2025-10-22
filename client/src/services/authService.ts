const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Debug: Log API_BASE_URL để kiểm tra
console.log('API_BASE_URL:', API_BASE_URL);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);

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
    // Xử lý URL để tránh lặp lại
    let baseUrl = API_BASE_URL;
    
    // Loại bỏ dấu / ở cuối API_BASE_URL nếu có
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    
    // Đảm bảo endpoint bắt đầu bằng /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Ghép URL
    const url = `${baseUrl}${cleanEndpoint}`;
    
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('baseUrl:', baseUrl);
    console.log('endpoint:', endpoint);
    console.log('cleanEndpoint:', cleanEndpoint);
    console.log('Final URL:', url);
    
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
    return this.makeRequest<ApiResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Public verification flow (no auth cookie required)
  async sendVerifyOtpPublic(email: string): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/auth/send-verify-otp-public', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyEmailPublic(email: string, otp: string): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/auth/verify-email-public', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async login(credentials: LoginRequest): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/auth/logout', {
      method: 'POST',
    });
  }

  async sendVerifyOtp(): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/auth/send-verify-otp', {
      method: 'POST',
    });
  }

  async verifyEmail(otpData: VerifyEmailRequest): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(otpData),
    });
  }

  async isAuthenticated(): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/auth/is-auth', {
      method: 'POST',
    });
  }

  async sendResetOtp(email: string): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/auth/send-reset-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(resetData: ResetPasswordRequest): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(resetData),
    });
  }
}

export const authService = new AuthService();

