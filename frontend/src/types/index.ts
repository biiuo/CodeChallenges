export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  role: 'STUDENT' | 'PROFESSOR' | 'ADMIN';
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  timeLimit: number;
  memoryLimit: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isPublic: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChallengeDto {
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  timeLimit: number;
  memoryLimit: number;
  isPublic: boolean;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  period: string;
  coverImage?: string;
  description?: string;
  category?: string;
  level?: string;
  group?: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCourseDto {
  code: string;
  name: string;
  period: string;
  professorCode?: string[];
}

export type SubmissionStatus = 
  | 'QUEUED' 
  | 'RUNNING' 
  | 'ACCEPTED' 
  | 'WRONG_ANSWER' 
  | 'TIME_LIMIT_EXCEEDED' 
  | 'MEMORY_LIMIT_EXCEEDED' 
  | 'RUNTIME_ERROR' 
  | 'COMPILATION_ERROR';

export interface Submission {
  id: number;
  userId: string;
  challengeId: string;
  code: string;
  language: string;
  status: SubmissionStatus;
  score?: number;
  timeMsTotal?: number;
  createdAt: string;
}

export interface CreateSubmissionDto {
  challengeId: string;
  code: string;
  language: string;
}

export interface TestCaseResult {
  caseId: number;
  caseNumber: number;
  status: 'PASSED' | 'FAILED';
  timeMsElapsed: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  visible: boolean;
}

export interface SubmissionResult {
  status: SubmissionStatus;
  score: number;
  totalTimeMs: number;
  cases: TestCaseResult[];
}

export interface Evaluation {
  id: number;
  evaluationNumber: number;
  name: string;
  description: string;
  date: string;
  maxDuration: number;
  courseId: string;
  createdAt: string;
}

export interface CreateEvaluationDto {
  name: string;
  description: string;
  date: string;
  maxDuration: number;
  courseId: string;
}

export interface Testcase {
  challengeId: string;
  caseNumber: number;
  input: string;
  output: string;
  visible: boolean;
  createdAt: string;
}
