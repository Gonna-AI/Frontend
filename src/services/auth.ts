import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const config = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData extends LoginData {
  name?: string;
}

export const auth = {
  async login(data: LoginData) {
    const response = await axios.post(`${API_URL}/auth/login`, data, config);
    return response.data;
  },

  async signup(data: SignupData) {
    const response = await axios.post(`${API_URL}/auth/signup`, data, config);
    return response.data;
  },

  async logout() {
    const response = await axios.get(`${API_URL}/auth/logout`, config);
    return response.data;
  },

  async checkAuth() {
    try {
      const response = await axios.get(`${API_URL}/auth/user`, config);
      return response.data;
    } catch (error) {
      return { isAuthenticated: false };
    }
  },

  async googleLogin() {
    const response = await axios.get(`${API_URL}/auth/google/login`, config);
    return response.data;
  }
}; 