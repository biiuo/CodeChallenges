import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const StudentLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-green-600 text-white shadow">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">CodeJudge - Student</Link>
          <div className="flex gap-4 items-center">
            <Link to="/student/courses" className="hover:text-gray-200">My Courses</Link>
            <Link to="/student/submissions" className="hover:text-gray-200">My Submissions</Link>
            <span className="text-sm">👤 {user?.name}</span>
            <button onClick={logout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Logout</button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};
