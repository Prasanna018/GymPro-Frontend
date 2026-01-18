import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  requiredRole?: 'owner' | 'member';
}

export const DashboardLayout = ({ children, requiredRole }: DashboardLayoutProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-glow p-8 rounded-full">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'owner' ? '/dashboard' : '/member'} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar userRole={user.role} />
      <main className="lg:pl-64 pt-16">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
