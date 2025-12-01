import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { ChatWidget } from '../chat/ChatWidget';
import { useAuth } from '../../context/AuthContext';

export const Layout: React.FC = () => {
  const { user } = useAuth();
  const showChat = user?.role === 'ADMIN' || user?.role === 'PROFESSOR';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        &copy; 2025 CodeChallenges
      </footer>
      {showChat && <ChatWidget />}
    </div>
  );
};
