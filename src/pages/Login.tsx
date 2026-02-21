import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dumbbell, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(email, password);

    if (success) {
      toast({
        title: 'Login Successful',
        description: 'Welcome back to GymPro!',
      });

      // Navigate based on role
      if (email === 'owner@gympro.com') {
        navigate('/dashboard');
      } else {
        navigate('/member');
      }
    } else {
      setError('Invalid email or password');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/20 mb-4">
              <Dumbbell className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-display text-4xl tracking-tight">
              <span className="text-foreground">GYM</span>
              <span className="text-gradient-primary">PRO</span>
            </h1>
            <p className="text-muted-foreground mt-2">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <div className="bg-gradient-card rounded-2xl border border-border/50 p-8 animate-scale-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an owner account?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Register here
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Demo Credentials
              </p>
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('owner@gympro.com');
                    setPassword('admin123');
                  }}
                  className="p-3 rounded-lg bg-muted/50 hover:bg-muted text-left transition-colors"
                >
                  <p className="text-sm font-medium text-foreground">Gym Owner</p>
                  <p className="text-xs text-muted-foreground">owner@gympro.com / admin123</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('rahul@email.com');
                    setPassword('member123');
                  }}
                  className="p-3 rounded-lg bg-muted/50 hover:bg-muted text-left transition-colors"
                >
                  <p className="text-sm font-medium text-foreground">Gym Member</p>
                  <p className="text-xs text-muted-foreground">rahul@email.com / member123</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
