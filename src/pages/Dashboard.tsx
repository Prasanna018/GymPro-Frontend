import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { MemberTable } from '@/components/dashboard/MemberTable';
import { dashboardStats, mockMembers, membershipPlans } from '@/lib/mockData';
import { Users, UserCheck, UserX, IndianRupee, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <DashboardLayout requiredRole="owner">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              OWNER <span className="text-gradient-primary">DASHBOARD</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's your gym overview.
            </p>
          </div>
          <Link to="/dashboard/members">
            <Button variant="hero" className="gap-2">
              <Users className="h-4 w-4" />
              Add New Member
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Total Members"
            value={dashboardStats.totalMembers}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Active Members"
            value={dashboardStats.activeMembers}
            icon={UserCheck}
            variant="accent"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Expired"
            value={dashboardStats.expiredMembers}
            icon={UserX}
            variant="warning"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${dashboardStats.totalRevenue.toLocaleString()}`}
            icon={IndianRupee}
            variant="primary"
          />
          <StatCard
            title="Pending Dues"
            value={`₹${dashboardStats.pendingDues.toLocaleString()}`}
            icon={AlertCircle}
            variant="warning"
          />
          <StatCard
            title="Monthly Revenue"
            value={`₹${dashboardStats.monthlyRevenue.toLocaleString()}`}
            icon={TrendingUp}
            variant="accent"
            trend={{ value: 8, isPositive: true }}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4">
          <Link to="/dashboard/members" className="stat-card hover:border-primary/50 transition-colors">
            <Users className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold text-foreground">Manage Members</h3>
            <p className="text-sm text-muted-foreground mt-1">Add, edit, or remove members</p>
          </Link>
          <Link to="/dashboard/payments" className="stat-card hover:border-primary/50 transition-colors">
            <IndianRupee className="h-6 w-6 text-accent mb-3" />
            <h3 className="font-semibold text-foreground">Fee Collection</h3>
            <p className="text-sm text-muted-foreground mt-1">Track payments and dues</p>
          </Link>
          <Link to="/dashboard/store" className="stat-card hover:border-primary/50 transition-colors">
            <TrendingUp className="h-6 w-6 text-info mb-3" />
            <h3 className="font-semibold text-foreground">Supplement Store</h3>
            <p className="text-sm text-muted-foreground mt-1">Manage inventory and sales</p>
          </Link>
          <Link to="/dashboard/reminders" className="stat-card hover:border-primary/50 transition-colors">
            <AlertCircle className="h-6 w-6 text-warning mb-3" />
            <h3 className="font-semibold text-foreground">Send Reminders</h3>
            <p className="text-sm text-muted-foreground mt-1">Email and WhatsApp alerts</p>
          </Link>
        </div>

        {/* Recent Members */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl text-foreground">
              RECENT <span className="text-gradient-primary">MEMBERS</span>
            </h2>
            <Link to="/dashboard/members">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <MemberTable 
            members={mockMembers.slice(0, 5)} 
            plans={membershipPlans}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
