import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockMembers, membershipPlans } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  IndianRupee, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  User,
  Filter
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const membersWithPaymentInfo = mockMembers.map(member => {
    const plan = membershipPlans.find(p => p.id === member.planId);
    const paymentStatus = member.dueAmount > 0 ? 'pending' : 'paid';
    return { ...member, plan, paymentStatus };
  });

  const filteredMembers = membersWithPaymentInfo.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPending = membersWithPaymentInfo
    .filter(m => m.paymentStatus === 'pending')
    .reduce((sum, m) => sum + m.dueAmount, 0);

  const totalCollected = membersWithPaymentInfo
    .filter(m => m.paymentStatus === 'paid')
    .reduce((sum, m) => sum + (m.plan?.price || 0), 0);

  const handleCollectPayment = (memberId: string, memberName: string) => {
    toast({
      title: 'Payment Collected',
      description: `Payment recorded for ${memberName}.`,
    });
  };

  return (
    <DashboardLayout requiredRole="owner">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground">
            FEE <span className="text-gradient-primary">COLLECTION</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage member payments.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-accent/20">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-xl font-bold text-foreground">₹{totalCollected.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-warning/20">
                <AlertCircle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Dues</p>
                <p className="text-xl font-bold text-foreground">₹{totalPending.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Members</p>
                <p className="text-xl font-bold text-foreground">
                  {membersWithPaymentInfo.filter(m => m.paymentStatus === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block rounded-xl border border-border/50 overflow-hidden bg-gradient-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Member</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Plan</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Due Date</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-medium">{member.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-foreground">{member.plan?.name}</td>
                    <td className="py-4 px-6 font-medium text-foreground">₹{member.plan?.price.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(member.expiryDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={
                        member.paymentStatus === 'paid'
                          ? 'bg-accent/20 text-accent border-accent/30'
                          : 'bg-warning/20 text-warning border-warning/30'
                      }>
                        {member.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {member.paymentStatus === 'pending' && (
                        <Button variant="hero" size="sm" onClick={() => handleCollectPayment(member.id, member.name)} className="gap-2">
                          <IndianRupee className="h-4 w-4" />Collect
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-gradient-card rounded-xl border border-border/50 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-medium">{member.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <Badge className={
                  member.paymentStatus === 'paid'
                    ? 'bg-accent/20 text-accent border-accent/30'
                    : 'bg-warning/20 text-warning border-warning/30'
                }>
                  {member.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-xs text-muted-foreground">Plan</span>
                  <p className="text-foreground font-medium">{member.plan?.name}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Amount</span>
                  <p className="text-foreground font-medium">₹{member.plan?.price.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Due Date</span>
                  <p className="text-foreground">{new Date(member.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>
              {member.paymentStatus === 'pending' && (
                <Button variant="hero" size="sm" className="w-full gap-2" onClick={() => handleCollectPayment(member.id, member.name)}>
                  <IndianRupee className="h-4 w-4" />Collect Payment
                </Button>
              )}
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No payment records found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Payments;
