import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockMembers, membershipPlans, mockPayments, mockAttendance } from '@/lib/mockData';
import { StatCard } from '@/components/dashboard/StatCard';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, CreditCard, ShoppingBag, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const MemberDashboard = () => {
  const { user } = useAuth();
  
  // Find member data (using mock data)
  const member = mockMembers.find(m => m.email === user?.email) || mockMembers[0];
  const plan = membershipPlans.find(p => p.id === member.planId);
  const memberPayments = mockPayments.filter(p => p.memberId === member.id);
  const memberAttendance = mockAttendance.filter(a => a.memberId === member.id);

  const getDaysRemaining = () => {
    const expiry = new Date(member.expiryDate);
    const today = new Date();
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <DashboardLayout requiredRole="member">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              WELCOME, <span className="text-gradient-primary">{member.name.split(' ')[0].toUpperCase()}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              {member.email} • {member.phone}
            </p>
          </div>
          <div className="lg:ml-auto">
            <Badge 
              className={cn(
                'text-sm px-4 py-2 border',
                member.status === 'active' 
                  ? 'bg-accent/20 text-accent border-accent/30' 
                  : 'bg-destructive/20 text-destructive border-destructive/30'
              )}
            >
              {member.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Current Plan"
            value={plan?.name || 'None'}
            icon={CreditCard}
            variant="primary"
          />
          <StatCard
            title="Days Remaining"
            value={getDaysRemaining()}
            icon={Calendar}
            variant={getDaysRemaining() < 30 ? 'warning' : 'accent'}
          />
          <StatCard
            title="Due Amount"
            value={`₹${member.dueAmount.toLocaleString()}`}
            icon={CreditCard}
            variant={member.dueAmount > 0 ? 'warning' : 'default'}
          />
          <StatCard
            title="This Month Visits"
            value={memberAttendance.length}
            icon={CheckCircle}
            variant="accent"
          />
        </div>

        {/* Membership Details */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Plan Details */}
          <div className="stat-card">
            <h2 className="font-display text-xl text-foreground mb-4">
              MEMBERSHIP <span className="text-gradient-primary">DETAILS</span>
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium text-foreground">{plan?.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-muted-foreground">Joining Date</span>
                <span className="font-medium text-foreground">{member.joiningDate}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-muted-foreground">Expiry Date</span>
                <span className="font-medium text-foreground">{member.expiryDate}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="font-medium text-accent">₹{member.paidAmount.toLocaleString()}</span>
              </div>
            </div>
            
            {plan && (
              <div className="mt-6 pt-4 border-t border-border/30">
                <p className="text-sm text-muted-foreground mb-3">Plan Features</p>
                <div className="space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Attendance */}
          <div className="stat-card">
            <h2 className="font-display text-xl text-foreground mb-4">
              RECENT <span className="text-gradient-primary">ATTENDANCE</span>
            </h2>
            <div className="space-y-3">
              {memberAttendance.length > 0 ? (
                memberAttendance.slice(0, 5).map((attendance) => (
                  <div 
                    key={attendance.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">{attendance.date}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        <Clock className="h-4 w-4 inline mr-1" />
                        {attendance.checkIn}
                      </span>
                      {attendance.checkOut && (
                        <span className="text-accent">
                          → {attendance.checkOut}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No attendance records yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="stat-card">
          <h2 className="font-display text-xl text-foreground mb-4">
            PAYMENT <span className="text-gradient-primary">HISTORY</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {memberPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border/30">
                    <td className="py-3 px-4 text-foreground">{payment.date}</td>
                    <td className="py-3 px-4 text-foreground">₹{payment.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        className={cn(
                          'border',
                          payment.status === 'paid' ? 'bg-accent/20 text-accent border-accent/30' :
                          payment.status === 'pending' ? 'bg-warning/20 text-warning border-warning/30' :
                          'bg-destructive/20 text-destructive border-destructive/30'
                        )}
                      >
                        {payment.status.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberDashboard;
