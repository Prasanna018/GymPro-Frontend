import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Member, MembershipPlan } from '@/lib/types';
import {
  Search,
  IndianRupee,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Filter,
  History,
  CreditCard,
  Receipt,
  RefreshCw,
  SplitSquareHorizontal,
  Loader2,
  Wallet,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface PaymentRecord {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  status: string;
  planId: string;
  method: string;
  invoiceId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

type MemberWithPlan = Member & { plan?: MembershipPlan; paymentStatus: string };

const Payments = () => {
  const [members, setMembers] = useState<MemberWithPlan[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [allPayments, setAllPayments] = useState<PaymentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [historySearch, setHistorySearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // ── Partial Payment Dialog state ───────────────────────────────────────────
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberWithPlan | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [membersData, plansData, paymentsData] = await Promise.all([
        api.get('/members'),
        api.get('/plans'),
        api.get('/payments'),
      ]);

      const membersWithPaymentInfo = membersData.map((member: Member) => {
        const plan = plansData.find((p: MembershipPlan) => p.id === member.planId);
        const paymentStatus = member.dueAmount > 0 ? 'pending' : 'paid';
        return { ...member, plan, paymentStatus };
      });

      setMembers(membersWithPaymentInfo);
      setPlans(plansData);
      setAllPayments(paymentsData);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load payment data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = allPayments.filter(p => {
    const member = members.find(m => m.id === p.memberId);
    const memberName = member?.name || '';
    const matchesSearch = memberName.toLowerCase().includes(historySearch.toLowerCase()) ||
      (p.invoiceId || '').toLowerCase().includes(historySearch.toLowerCase()) ||
      (p.razorpayPaymentId || '').toLowerCase().includes(historySearch.toLowerCase());
    const matchesMethod = methodFilter === 'all' ||
      (methodFilter === 'online' && (p.method || '').toLowerCase().includes('razorpay')) ||
      (methodFilter === 'cash' && (p.method || '').toLowerCase() === 'cash') ||
      (methodFilter === 'upi' && (p.method || '').toLowerCase() === 'upi');
    return matchesSearch && matchesMethod;
  });

  const totalPending = members.filter(m => m.paymentStatus === 'pending')
    .reduce((sum, m) => sum + m.dueAmount, 0);
  const totalCollected = allPayments.filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const onlinePayments = allPayments.filter(p => (p.method || '').toLowerCase().includes('razorpay'));
  const cashPayments = allPayments.filter(p => !['razorpay', 'upi'].some(x => (p.method || '').toLowerCase().includes(x)));

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member?.name || 'Unknown Member';
  };

  // ── Open collection dialog ──────────────────────────────────────────────────
  const openPayDialog = (member: MemberWithPlan) => {
    setSelectedMember(member);
    setCustomAmount(String(member.dueAmount)); // prefill with full due amount
    setPaymentMethod('Cash');
    setPayDialogOpen(true);
  };

  // ── Submit partial payment ──────────────────────────────────────────────────
  const handleCollectPayment = async () => {
    if (!selectedMember) return;
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid amount', description: 'Please enter a valid amount greater than 0.', variant: 'destructive' });
      return;
    }
    if (amount > selectedMember.dueAmount) {
      toast({ title: 'Amount too high', description: `Maximum collectable is ₹${selectedMember.dueAmount.toLocaleString()}.`, variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      await api.post('/payments/partial', {
        memberId: selectedMember.id,
        planId: selectedMember.planId,
        paidAmount: amount,
        method: paymentMethod,
      });

      const remaining = selectedMember.dueAmount - amount;
      toast({
        title: `₹${amount.toLocaleString()} Collected ✅`,
        description: remaining > 0
          ? `₹${remaining.toLocaleString()} remaining balance recorded as due.`
          : 'Full payment received. Member balance is clear.',
      });
      setPayDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to record payment', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout requiredRole="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              PAYMENT <span className="text-gradient-primary">MANAGEMENT</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Collect dues and view all payment transactions.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent/20">
                  <CheckCircle className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Collected</p>
                  <p className="text-lg font-bold text-foreground">₹{totalCollected.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-warning/20">
                  <AlertCircle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending Dues</p>
                  <p className="text-lg font-bold text-foreground">₹{totalPending.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/20">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Online Payments</p>
                  <p className="text-lg font-bold text-foreground">{onlinePayments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-muted/40">
                  <IndianRupee className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cash Payments</p>
                  <p className="text-lg font-bold text-foreground">{cashPayments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="collect" className="space-y-4">
          <TabsList className="bg-muted/30 p-1 rounded-xl">
            <TabsTrigger value="collect" className="gap-2 rounded-lg data-[state=active]:bg-card">
              <User className="h-4 w-4" />
              Fee Collection
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 rounded-lg data-[state=active]:bg-card">
              <History className="h-4 w-4" />
              Transaction History
              {allPayments.length > 0 && (
                <Badge className="ml-1 h-5 w-5 p-0 text-xs bg-primary/20 text-primary border-primary/30">
                  {allPayments.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Fee Collection ── */}
          <TabsContent value="collect" className="space-y-4">
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
                  <SelectItem value="all">All Members</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block rounded-xl border border-border/50 overflow-hidden bg-gradient-card">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50 bg-muted/20">
                          <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Member</th>
                          <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Plan</th>
                          <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Total Due</th>
                          <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Expiry</th>
                          <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMembers.map((member) => (
                          <tr key={member.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                  <span className="text-primary font-medium text-sm">{member.name.charAt(0)}</span>
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{member.name}</p>
                                  <p className="text-xs text-muted-foreground">{member.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-foreground text-sm">{member.plan?.name || '—'}</td>
                            <td className="py-4 px-6">
                              {member.dueAmount > 0 ? (
                                <span className="font-semibold text-warning">₹{member.dueAmount.toLocaleString()}</span>
                              ) : (
                                <span className="text-accent font-medium">No dues</span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2 text-muted-foreground text-sm">
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
                                <Button
                                  variant="hero"
                                  size="sm"
                                  onClick={() => openPayDialog(member)}
                                  className="gap-2"
                                >
                                  <Wallet className="h-4 w-4" />
                                  Collect
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredMembers.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">No payment records found.</div>
                  )}
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
                          <p className="font-medium">{member.plan?.name || '—'}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Total Due</span>
                          <p className={`font-semibold ${member.dueAmount > 0 ? 'text-warning' : 'text-accent'}`}>
                            {member.dueAmount > 0 ? `₹${member.dueAmount.toLocaleString()}` : 'No dues'}
                          </p>
                        </div>
                      </div>
                      {member.paymentStatus === 'pending' && (
                        <Button variant="hero" size="sm" className="w-full gap-2" onClick={() => openPayDialog(member)}>
                          <Wallet className="h-4 w-4" />
                          Collect Payment
                        </Button>
                      )}
                    </div>
                  ))}
                  {filteredMembers.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">No records found.</div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* ── Tab 2: Transaction History ── */}
          <TabsContent value="history" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, invoice, or transaction ID..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="online">Online (Razorpay)</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-gradient-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg">
                  <Receipt className="h-5 w-5 text-primary" />
                  All Transactions
                </CardTitle>
                <CardDescription>
                  {filteredPayments.length} transaction{filteredPayments.length !== 1 ? 's' : ''} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : filteredPayments.length > 0 ? (
                  <div className="space-y-3">
                    {filteredPayments.map((payment) => {
                      const isOnline = (payment.method || '').toLowerCase().includes('razorpay');
                      const isPartial = payment.status === 'pending';
                      return (
                        <div
                          key={payment.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30 gap-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "p-2 rounded-lg flex-shrink-0",
                              isOnline ? "bg-primary/20" : isPartial ? "bg-warning/10" : "bg-muted/40"
                            )}>
                              {isOnline
                                ? <CreditCard className="h-5 w-5 text-primary" />
                                : isPartial
                                  ? <SplitSquareHorizontal className="h-5 w-5 text-warning" />
                                  : <IndianRupee className="h-5 w-5 text-muted-foreground" />
                              }
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-foreground">
                                  {getMemberName(payment.memberId)}
                                </p>
                                <Badge className={cn(
                                  "text-xs",
                                  isOnline
                                    ? "bg-primary/20 text-primary border-primary/30"
                                    : "bg-muted/60 text-muted-foreground border-border/50"
                                )}>
                                  {isOnline ? '⚡ Online' : payment.method || 'Cash'}
                                </Badge>
                                {isPartial && (
                                  <Badge className="text-xs bg-warning/20 text-warning border-warning/30">
                                    Partial
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(payment.date).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                })}
                                {payment.invoiceId && ` · ${payment.invoiceId}`}
                              </p>
                              {payment.razorpayPaymentId && (
                                <p className="text-xs text-muted-foreground/70 font-mono mt-0.5 truncate max-w-[280px]">
                                  Txn: {payment.razorpayPaymentId}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 sm:flex-shrink-0 sm:text-right">
                            <div>
                              <p className="font-bold text-foreground text-lg">
                                ₹{payment.amount.toLocaleString()}
                              </p>
                              <Badge className={cn(
                                "text-xs",
                                payment.status === 'paid'
                                  ? 'bg-accent/20 text-accent border-accent/30'
                                  : 'bg-warning/20 text-warning border-warning/30'
                              )}>
                                {payment.status === 'paid' ? 'PAID' : 'PARTIAL'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No transactions found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ── Collect Payment Dialog ── */}
        <Dialog open={payDialogOpen} onOpenChange={(open) => {
          setPayDialogOpen(open);
          if (!open) setSelectedMember(null);
        }}>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                COLLECT <span className="text-gradient-primary">PAYMENT</span>
              </DialogTitle>
            </DialogHeader>

            {selectedMember && (
              <div className="space-y-5 mt-2">
                {/* Member info summary */}
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-bold">{selectedMember.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{selectedMember.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedMember.plan?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2.5 rounded-lg bg-warning/10 border border-warning/20">
                      <p className="text-xs text-warning/70 font-medium uppercase tracking-wider mb-0.5">Total Due</p>
                      <p className="font-bold text-warning text-lg">₹{selectedMember.dueAmount.toLocaleString()}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-accent/10 border border-accent/20">
                      <p className="text-xs text-accent/70 font-medium uppercase tracking-wider mb-0.5">Total Paid</p>
                      <p className="font-bold text-accent text-lg">₹{selectedMember.paidAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Amount input */}
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Amount Collecting Now (₹)
                    <span className="text-xs text-muted-foreground ml-2">
                      — enter any amount ≤ ₹{selectedMember.dueAmount.toLocaleString()}
                    </span>
                  </Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      min={1}
                      max={selectedMember.dueAmount}
                      step={0.01}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="pl-9 text-lg font-bold"
                      placeholder="0"
                    />
                  </div>

                  {/* Live balance preview */}
                  {customAmount && !isNaN(parseFloat(customAmount)) && (
                    <div className={cn(
                      "p-3 rounded-lg border text-sm flex items-center gap-2",
                      parseFloat(customAmount) >= selectedMember.dueAmount
                        ? "bg-accent/10 border-accent/30 text-accent"
                        : "bg-warning/10 border-warning/30 text-warning"
                    )}>
                      {parseFloat(customAmount) >= selectedMember.dueAmount ? (
                        <>
                          <CheckCircle className="h-4 w-4 flex-shrink-0" />
                          <span>Full payment — balance will be cleared ✓</span>
                        </>
                      ) : (
                        <>
                          <SplitSquareHorizontal className="h-4 w-4 flex-shrink-0" />
                          <span>
                            Partial payment — <strong>₹{Math.max(0, selectedMember.dueAmount - parseFloat(customAmount)).toLocaleString()}</strong> will remain as due
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Payment method */}
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">💵 Cash</SelectItem>
                      <SelectItem value="UPI">📱 UPI</SelectItem>
                      <SelectItem value="Card">💳 Card</SelectItem>
                      <SelectItem value="Bank Transfer">🏦 Bank Transfer</SelectItem>
                      <SelectItem value="Cheque">📋 Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quick fill buttons */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setCustomAmount(String(selectedMember.dueAmount))}
                  >
                    Full Amount (₹{selectedMember.dueAmount.toLocaleString()})
                  </Button>
                  {selectedMember.dueAmount > 500 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => setCustomAmount(String(Math.floor(selectedMember.dueAmount / 2)))}
                    >
                      Half (₹{Math.floor(selectedMember.dueAmount / 2).toLocaleString()})
                    </Button>
                  )}
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setPayDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="hero"
                    className="flex-1 gap-2"
                    onClick={handleCollectPayment}
                    disabled={isSaving || !customAmount || parseFloat(customAmount) <= 0}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <IndianRupee className="h-4 w-4" />}
                    Collect ₹{customAmount ? parseFloat(customAmount).toLocaleString() : '—'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
