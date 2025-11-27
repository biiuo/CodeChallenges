import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Vencer A Backend</Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link to="/challenges" className="hover:text-gray-300">Challenges</Link>
              <Link to="/courses" className="hover:text-gray-300">Courses</Link>
              <Link to="/submissions" className="hover:text-gray-300">Submissions</Link>
              <span className="text-gray-400">|</span>
              <span className="font-semibold">{user.username}</span>
              <button onClick={handleLogout} className="hover:text-red-400">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300">Login</Link>
              <Link to="/signup" className="hover:text-gray-300">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
