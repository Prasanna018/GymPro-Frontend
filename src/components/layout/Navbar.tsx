import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dumbbell, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SidebarContent } from './Sidebar';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Hamburger (mobile sidebar) + Logo */}
          <div className="flex items-center gap-2">
            {/* Mobile Sidebar Trigger - only when logged in */}
            {user && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <button className="lg:hidden p-2 text-foreground rounded-lg hover:bg-muted/30 transition-colors">
                    <Menu className="h-6 w-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 bg-sidebar border-sidebar-border">
                  <SidebarContent
                    userRole={user.role}
                    onLinkClick={() => setSidebarOpen(false)}
                  />
                </SheetContent>
              </Sheet>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                <Dumbbell className="h-6 w-6 text-primary" />
              </div>
              <span className="font-display text-2xl tracking-wider text-gradient-primary">
                GYMPRO
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link to={user.role === 'owner' ? '/dashboard' : '/member'}>
                  <Button variant="ghost" className="gap-2">
                    <User className="h-4 w-4" />
                    {user.name}
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/login">
                  <Button variant="hero">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right: User actions when logged in, or hamburger for non-auth pages */}
          <div className="md:hidden flex items-center gap-2">
            {user ? (
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5 text-xs">
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </Button>
            ) : (
              <button
                className="p-2 text-foreground"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu for non-logged-in users */}
        {!user && mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/30 animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full">Login</Button>
              </Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="hero" className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
