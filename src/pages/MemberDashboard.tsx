import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { Member, MembershipPlan, Payment, Attendance } from '@/lib/types';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [plan, setPlan] = useState<MembershipPlan | null>(null);
  const [memberPayments, setMemberPayments] = useState<Payment[]>([]);
  const [memberAttendance, setMemberAttendance] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [memberData, plansData, paymentsData, attendanceData] = await Promise.all([
          api.get('/members/me'),
          api.get('/plans'),
          api.get('/payments/me'),
          api.get('/attendance/me')
        ]);

        setMember(memberData);
        setMemberPayments(paymentsData);
        setMemberAttendance(attendanceData);

        const myPlan = plansData.find((p: MembershipPlan) => p.id === memberData.planId);
        setPlan(myPlan);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getDaysRemaining = () => {
    if (!member) return 0;
    const expiry = new Date(member.expiryDate);
    const today = new Date();
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (isLoading || !member) {
    return (
      <DashboardLayout requiredRole="member">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="member">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <User className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl md:text-4xl text-foreground">
              WELCOME, <span className="text-gradient-primary">{member.name.split(' ')[0].toUpperCase()}</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {member.email} • {member.phone}
            </p>
          </div>
          <Badge
            className={cn(
              'text-sm px-3 py-1.5 border self-start sm:self-auto',
              member.status === 'active'
                ? 'bg-accent/20 text-accent border-accent/30'
                : 'bg-destructive/20 text-destructive border-destructive/30'
            )}
          >
            {member.status.toUpperCase()}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard title="Current Plan" value={plan?.name || 'None'} icon={CreditCard} variant="primary" />
          <StatCard title="Days Remaining" value={getDaysRemaining()} icon={Calendar} variant={getDaysRemaining() < 30 ? 'warning' : 'accent'} />
          <StatCard title="Due Amount" value={`₹${member.dueAmount.toLocaleString()}`} icon={CreditCard} variant={member.dueAmount > 0 ? 'warning' : 'default'} />
          <StatCard title="This Month" value={memberAttendance.length} icon={CheckCircle} variant="accent" />
        </div>

        {/* Membership Details */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
          {/* Plan Details */}
          <div className="stat-card">
            <h2 className="font-display text-xl text-foreground mb-4">
              MEMBERSHIP <span className="text-gradient-primary">DETAILS</span>
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Plan', value: plan?.name },
                { label: 'Joining Date', value: member.joiningDate },
                { label: 'Expiry Date', value: member.expiryDate },
                { label: 'Total Paid', value: `₹${member.paidAmount.toLocaleString()}`, accent: true },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                  <span className="text-muted-foreground text-sm">{item.label}</span>
                  <span className={cn('font-medium text-sm', item.accent ? 'text-accent' : 'text-foreground')}>{item.value}</span>
                </div>
              ))}
            </div>

            {plan && plan.features && (
              <div className="mt-4 pt-4 border-t border-border/30">
                <p className="text-sm text-muted-foreground mb-3">Plan Features</p>
                <div className="space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
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
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="font-medium text-foreground text-sm">{attendance.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                      <Clock className="h-3.5 w-3.5" />
                      {attendance.checkIn}
                      {attendance.checkOut && <span className="text-accent">→ {attendance.checkOut}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8 text-sm">No attendance records yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="stat-card">
          <h2 className="font-display text-xl text-foreground mb-4">
            PAYMENT <span className="text-gradient-primary">HISTORY</span>
          </h2>
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {memberPayments.slice(0, 5).map((payment) => (
                  <tr key={payment.id} className="border-b border-border/30">
                    <td className="py-3 px-4 text-foreground text-sm">{payment.date}</td>
                    <td className="py-3 px-4 text-foreground text-sm">₹{payment.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge
                        className={cn(
                          'border text-xs',
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
          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {memberPayments.slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium text-foreground text-sm">₹{payment.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{payment.date}</p>
                </div>
                <Badge
                  className={cn(
                    'border text-xs',
                    payment.status === 'paid' ? 'bg-accent/20 text-accent border-accent/30' :
                      payment.status === 'pending' ? 'bg-warning/20 text-warning border-warning/30' :
                        'bg-destructive/20 text-destructive border-destructive/30'
                  )}
                >
                  {payment.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberDashboard;
