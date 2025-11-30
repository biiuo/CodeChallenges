import axios from 'axios';
import type { 
  User, AuthResponse, Challenge, CreateChallengeDto, 
  Course, CreateCourseDto, Submission, CreateSubmissionDto,
  SubmissionResult, Evaluation, CreateEvaluationDto, Testcase
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
  getAll: () => api.get<User[]>('/users'),
  create: (data: any) => api.post<User>('/users', data),
  update: (id: string, data: any) => api.put<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const challengesApi = {
  getAll: () => api.get<Challenge[]>('/challenges'),
  getById: (id: string) => api.get<Challenge>(`/challenges/${id}`),
  create: (data: CreateChallengeDto) => api.post<Challenge>('/challenges', data),
  update: (id: string, data: Partial<CreateChallengeDto>) => api.put<Challenge>(`/challenges/${id}`, data),
  delete: (id: string) => api.delete(`/challenges/${id}`),
  addTestCases: (id: string, data: any[]) => api.post(`/challenges/${id}/testcases`, data),
  uploadSolution: (id: string, data: { code: string; language: string }) => api.post(`/challenges/${id}/solution`, data),
};

export const submissionsApi = {
  create: (data: CreateSubmissionDto) => api.post<Submission>('/submissions', data),
  getAll: (params?: any) => api.get<Submission[]>('/submissions', { params }),
  getById: (id: number) => api.get<Submission>(`/submissions/${id}`),
  getResults: (id: number) => api.get<any[]>(`/submissions/${id}/results`),
  execute: (id: number) => api.post<SubmissionResult>(`/submissions/${id}/execute`),
  getMetrics: () => api.get<any>('/submissions/metrics/json'),
};

export const coursesApi = {
  getAll: () => api.get<Course[]>('/courses'),
  getMine: () => api.get<Course[]>('/courses/my'),
  getById: (id: string) => api.get<Course>(`/courses/${id}`),
  getByCode: (code: string) => api.get<Course>(`/courses/${code}`),
  create: (data: CreateCourseDto) => api.post<Course>('/courses', data),
  update: (id: string, data: Partial<CreateCourseDto>) => api.put<Course>(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
  getChallenges: (id: string) => api.get<Challenge[]>(`/courses/${id}/challenges`),
  getMyChallenges: (id: string) => api.get<Challenge[]>(`/courses/${id}/my/challenges`),
  getSubmissions: (id: string, params?: any) => api.get<Submission[]>(`/courses/${id}/submissions`, { params }),
  getMySubmissions: (id: string) => api.get<Submission[]>(`/courses/${id}/my/submissions`),
  assignChallenge: (id: string, challengeId: string) => api.post(`/courses/${id}/challenges/${challengeId}`),
  unassignChallenge: (id: string, challengeId: string) => api.delete(`/courses/${id}/challenges/${challengeId}`),
  getUserActivity: async (params: { userId: string; courseId?: string; challengeId?: string; status?: string; from?: string; to?: string }) => {
    const { userId, ...rest } = params;
    const { data } = await api.get(`/admin/users/${userId}/activity`, { params: rest });
    return data;
  },
  enrollStudent: (id: string, userId: string) => api.post(`/courses/${id}/students/${userId}`),
  selfEnroll: (id: string) => api.post(`/courses/${id}/enroll`),
  selfUnenroll: (id: string) => api.delete(`/courses/${id}/unenroll`),
  removeStudent: (id: string, userId: string) => api.delete(`/courses/${id}/students/${userId}`),
  getStudents: (id: string) => api.get(`/courses/${id}/students`),
  assignProfessor: (id: string, userId: string) => api.post(`/courses/${id}/professors/${userId}`),
  removeProfessor: (id: string, userId: string) => api.delete(`/courses/${id}/professors/${userId}`),
  
  // Course content management
  updateMetadata: (id: string, data: any) => api.put(`/courses/${id}/metadata`, data),
  getLessons: (id: string) => api.get(`/courses/${id}/lessons`),
  createLesson: (id: string, data: any) => api.post(`/courses/${id}/lessons`, data),
  updateLesson: (id: string, lessonId: string, data: any) => api.put(`/courses/${id}/lessons/${lessonId}`, data),
  deleteLesson: (id: string, lessonId: string) => api.delete(`/courses/${id}/lessons/${lessonId}`),
  addResource: (id: string, lessonId: string, data: any) => api.post(`/courses/${id}/lessons/${lessonId}/resources`, data),
  deleteResource: (id: string, lessonId: string, resourceId: string) => api.delete(`/courses/${id}/lessons/${lessonId}/resources/${resourceId}`),
};

export const evaluationsApi = {
  getAll: () => api.get<Evaluation[]>('/evaluations'),
  getById: (id: number) => api.get<Evaluation>(`/evaluations/${id}`),
  create: (data: CreateEvaluationDto) => api.post<Evaluation>('/evaluations', data),
  update: (id: number, data: Partial<CreateEvaluationDto>) => api.put<Evaluation>(`/evaluations/${id}`, data),
  delete: (id: number) => api.delete(`/evaluations/${id}`),
  addChallenge: (id: number, challengeId: string) => api.post(`/evaluations/${id}/challenges/${challengeId}`),
  removeChallenge: (id: number, challengeId: string) => api.delete(`/evaluations/${id}/challenges/${challengeId}`),
  getSubmissions: (id: number) => api.get<Submission[]>(`/evaluations/${id}/submissions`),
};

export const testcasesApi = {
  getAll: (challengeId: string) => api.get<Testcase[]>(`/challenges/${challengeId}/testcases`),
  add: (challengeId: string, data: Partial<Testcase>[]) => api.post(`/challenges/${challengeId}/testcases`, data),
  delete: (challengeId: string, caseNumber: number) => api.delete(`/challenges/${challengeId}/testcases/${caseNumber}`),
};
