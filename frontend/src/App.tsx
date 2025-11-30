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
import { SubmissionList } from './pages/submissions/SubmissionList';
import { SubmissionDetail } from './pages/submissions/SubmissionDetail';

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
                <Route path="/challenges" element={<ChallengeList />} />
                <Route path="/challenges/create" element={<CreateChallenge />} />
                <Route path="/challenges/edit/:id" element={<EditChallenge />} />
                <Route path="/challenges/:id" element={<ChallengeDetail />} />
                <Route path="/courses" element={<CourseList />} />
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
