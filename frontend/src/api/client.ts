import axios from 'axios';
import type { 
  User, AuthResponse, Challenge, CreateChallengeDto, 
  Course, CreateCourseDto, Submission, CreateSubmissionDto,
  SubmissionResult
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post<AuthResponse>(`${API_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });
          
          localStorage.setItem('token', data.access);
          localStorage.setItem('refreshToken', data.refresh);
          
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  signup: (data: any) => api.post<AuthResponse>('/auth/signup', data),
  login: (data: any) => api.post<AuthResponse>('/auth/login', data),
  refresh: () => api.post<AuthResponse>('/auth/refresh'),
};

export const usersApi = {
  me: () => api.get<User>('/users/me'),
};

export const challengesApi = {
  getAll: () => api.get<Challenge[]>('/challenges'),
  getById: (id: string) => api.get<Challenge>(`/challenges/${id}`),
  create: (data: CreateChallengeDto) => api.post<Challenge>('/challenges', data),
  update: (id: string, data: Partial<CreateChallengeDto>) => api.put<Challenge>(`/challenges/${id}`, data),
  delete: (id: string) => api.delete(`/challenges/${id}`),
  addTestCases: (id: string, data: any[]) => api.post(`/challenges/${id}/testcases`, data),
};

export const submissionsApi = {
  create: (data: CreateSubmissionDto) => api.post<Submission>('/submissions', data),
  getAll: () => api.get<Submission[]>('/submissions'),
  getById: (id: number) => api.get<Submission>(`/submissions/${id}`),
  getResults: (id: number) => api.get<any[]>(`/submissions/${id}/results`),
  execute: (id: number) => api.post<SubmissionResult>(`/submissions/${id}/execute`),
  getMetrics: () => api.get<any>('/submissions/metrics/json'),
};

export const coursesApi = {
  getAll: () => api.get<Course[]>('/courses'),
  getByCode: (code: string) => api.get<Course>(`/courses/${code}`),
  create: (data: CreateCourseDto) => api.post<Course>('/courses', data),
  update: (code: string, data: Partial<CreateCourseDto>) => api.put<Course>(`/courses/${code}`, data),
  delete: (code: string) => api.delete(`/courses/${code}`),
};

