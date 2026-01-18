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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
        <div className="grid md:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-accent/20">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-bold text-foreground">₹{totalCollected.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-foreground">₹{totalPending.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-foreground">
                  {membersWithPaymentInfo.filter(m => m.paymentStatus === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
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

        {/* Payments Table */}
        <div className="rounded-xl border border-border/50 overflow-hidden bg-gradient-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Member</TableHead>
                <TableHead className="text-muted-foreground">Plan</TableHead>
                <TableHead className="text-muted-foreground">Amount</TableHead>
                <TableHead className="text-muted-foreground">Due Date</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id} className="border-border/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{member.plan?.name}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    ₹{member.plan?.price.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(member.expiryDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={member.paymentStatus === 'paid' ? 'default' : 'secondary'}
                      className={
                        member.paymentStatus === 'paid'
                          ? 'bg-accent/20 text-accent border-accent/30'
                          : 'bg-warning/20 text-warning border-warning/30'
                      }
                    >
                      {member.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {member.paymentStatus === 'pending' && (
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={() => handleCollectPayment(member.id, member.name)}
                        className="gap-2"
                      >
                        <IndianRupee className="h-4 w-4" />
                        Collect
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
