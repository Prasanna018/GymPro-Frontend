import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dumbbell, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setIsSuccess(true);
            toast({
                title: 'Reset Link Sent',
                description: 'If your email is registered, you will see a reset token in the backend console.',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to send reset link',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <div className="min-h-screen flex items-center justify-center px-4 pt-16">
                <div className="w-full max-w-md">
                    {/* Back Button */}
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Login
                    </Link>

                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/20 mb-4">
                            <Dumbbell className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="font-display text-4xl tracking-tight">
                            FORGOT <span className="text-gradient-primary">PASSWORD</span>
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Enter your email to receive a password reset token
                        </p>
                    </div>

                    <div className="bg-gradient-card rounded-2xl border border-border/50 p-8">
                        {isSuccess ? (
                            <div className="text-center py-4">
                                <div className="inline-flex items-center justify-center p-3 rounded-full bg-success/20 mb-4">
                                    <CheckCircle2 className="h-8 w-8 text-success" />
                                </div>
                                <h2 className="text-xl font-semibold mb-2">Check Your Email</h2>
                                <p className="text-muted-foreground mb-6 text-sm">
                                    We've sent a password reset link and token to <strong>{email}</strong>.
                                    Please check your inbox (and spam folder) to proceed.
                                </p>
                                <Link to="/reset-password">
                                    <Button variant="hero" className="w-full">
                                        Enter Reset Token
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your registered email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    variant="hero"
                                    size="lg"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Reset Token'
                                    )}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
