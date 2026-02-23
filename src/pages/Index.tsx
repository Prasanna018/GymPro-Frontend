import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Link } from 'react-router-dom';
import {
  Dumbbell,
  Users,
  CreditCard,
  ShoppingBag,
  Bell,
  ChevronRight,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import heroImage from '@/assets/hero-gym.jpg';

const features = [
  {
    icon: Users,
    title: 'Member Management',
    description: 'Add, update, and track all members with detailed profiles and membership status.',
  },
  {
    icon: CreditCard,
    title: 'Fee & Payment Tracking',
    description: 'Track dues, payments, and auto-calculate next payment dates seamlessly.',
  },
  {
    icon: ShoppingBag,
    title: 'Supplement Store',
    description: 'Manage your in-house supplement store with stock tracking and sales history.',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Zero-cost automated email reminders for fee dues and membership expiry.',
  },
];

const plans = [
  { name: 'Monthly', price: '₹1,500', features: ['Full gym access', 'Locker facility', 'Basic training'] },
  { name: 'Quarterly', price: '₹4,000', features: ['Full gym access', 'Locker facility', 'Personal trainer', 'Diet consultation'], popular: true },
  { name: 'Yearly', price: '₹12,000', features: ['Full gym access', 'Premium locker', 'Weekly trainer', 'Diet plan', 'Store discounts'] },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Modern gym interior"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 pt-20 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8">
              <Dumbbell className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Complete Gym Management Solution</span>
            </div>

            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl tracking-tight mb-6">
              <span className="text-foreground">GYM</span>
              <span className="text-gradient-primary">PRO</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Digitize your gym operations. Manage members, track fees, run your supplement store,
              and automate reminders — all in one powerful platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button variant="hero" size="xl" className="gap-2 w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Member Login
                </Button>
              </Link>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronRight className="h-8 w-8 text-primary rotate-90" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              POWERFUL <span className="text-gradient-primary">FEATURES</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to run a modern gym, from member management to automated reminders.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="stat-card"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-3 rounded-lg bg-primary/20 w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Plans */}
      <section className="py-24 bg-card/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              MEMBERSHIP <span className="text-gradient-primary">PLANS</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Flexible plans designed to meet your fitness goals and budget.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-gradient-card rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-2 ${plan.popular
                    ? 'border-primary shadow-glow'
                    : 'border-border/50 hover:border-primary/30'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full text-xs font-bold text-primary-foreground">
                    MOST POPULAR
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="font-display text-2xl text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-gradient-primary">
                    {plan.price}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  className="w-full"
                >
                  Choose Plan
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-card border border-border/50 p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(175,95%,50%,0.1),transparent_70%)]" />

            <div className="relative z-10">
              <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
                READY TO <span className="text-gradient-primary">TRANSFORM</span> YOUR GYM?
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                Join hundreds of gym owners who have digitized their operations with GymPro.
              </p>
              <Link to="/login">
                <Button variant="hero" size="xl" className="gap-2">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              <span className="font-display text-xl text-gradient-primary">GYMPRO</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} GymPro. College Project - Gym Management System.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
