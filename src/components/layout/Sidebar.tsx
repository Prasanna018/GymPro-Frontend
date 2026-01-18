import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Calendar,
  ShoppingBag,
  Bell,
  Settings,
  Dumbbell,
} from 'lucide-react';

interface SidebarProps {
  userRole: 'owner' | 'member';
}

const ownerLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/members', label: 'Members', icon: Users },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/attendance', label: 'Attendance', icon: Calendar },
  { href: '/dashboard/store', label: 'Store', icon: ShoppingBag },
  { href: '/dashboard/reminders', label: 'Reminders', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const memberLinks = [
  { href: '/member', label: 'My Profile', icon: Users },
  { href: '/member/payments', label: 'Payments', icon: CreditCard },
  { href: '/member/attendance', label: 'Attendance', icon: Calendar },
  { href: '/member/store', label: 'Store', icon: ShoppingBag },
];

export const Sidebar = ({ userRole }: SidebarProps) => {
  const location = useLocation();
  const links = userRole === 'owner' ? ownerLinks : memberLinks;

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-sidebar border-r border-sidebar-border hidden lg:block">
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center gap-3 mb-8 px-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-sidebar-foreground">
              {userRole === 'owner' ? 'Admin Panel' : 'Member Portal'}
            </p>
            <p className="text-xs text-muted-foreground">GymPro System</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/20 text-primary shadow-glow'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-sidebar-border">
          <div className="px-3 py-2 text-xs text-muted-foreground">
            © 2024 GymPro
          </div>
        </div>
      </div>
    </aside>
  );
};
