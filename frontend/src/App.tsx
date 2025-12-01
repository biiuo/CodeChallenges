import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { Dashboard } from './pages/dashboard/Dashboard';
import { ChallengeList } from './pages/challenges/ChallengeList';
import { ChallengeDetail } from './pages/challenges/ChallengeDetail';
import { CreateChallenge } from './pages/challenges/CreateChallenge';
import { EditChallenge } from './pages/challenges/EditChallenge';
import { CourseList } from './pages/courses/CourseList';
import { CourseCatalog } from './pages/courses/CourseCatalog';
import { CourseDetail } from './pages/courses/CourseDetail';
import { SubmissionList } from './pages/submissions/SubmissionList';
import { SubmissionDetail } from './pages/submissions/SubmissionDetail';
import { Users } from './pages/admin/Users';
import UserActivity from './pages/admin/UserActivity';
import ProfessorPanel from './pages/admin/ProfessorPanel';
import { UserManagement } from './pages/admin/UserManagement';
import { CreateEvaluation } from './pages/evaluations/CreateEvaluation';
import { EditEvaluation } from './pages/evaluations/EditEvaluation';
import { EvaluationDetail } from './pages/evaluations/EvaluationDetail';
import { EvaluationResults } from './pages/evaluations/EvaluationResults';
import { MyEvaluationResults } from './pages/evaluations/MyEvaluationResults';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route element={<Layout />}>
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/professors" element={<ProfessorPanel />} />
                <Route path="/admin/user-activity" element={<UserActivity />} />
                <Route path="/challenges" element={<ChallengeList />} />
                <Route path="/challenges/create" element={<CreateChallenge />} />
                <Route path="/challenges/edit/:id" element={<EditChallenge />} />
                <Route path="/challenges/:id" element={<ChallengeDetail />} />
                <Route path="/courses" element={<CourseList />} />
                <Route path="/courses/catalog" element={<CourseCatalog />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/courses/:courseId/evaluations/create" element={<CreateEvaluation />} />
                <Route path="/courses/:courseId/evaluations/:id/edit" element={<EditEvaluation />} />
                <Route path="/evaluations/:id" element={<EvaluationDetail />} />
                <Route path="/evaluations/:id/results" element={<EvaluationResults />} />
                <Route path="/evaluations/:id/my-results" element={<MyEvaluationResults />} />
                <Route path="/submissions" element={<SubmissionList />} />
                <Route path="/submissions/:id" element={<SubmissionDetail />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
