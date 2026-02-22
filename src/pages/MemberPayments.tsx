import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IndianRupee,
  Calendar,
  CheckCircle,
  AlertCircle,
  Download,
  CreditCard,
  Receipt
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Member, MembershipPlan, Payment } from '@/lib/types';
import { cn } from '@/lib/utils';

const MemberPayments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [member, setMember] = useState<Member | null>(null);
  const [plan, setPlan] = useState<MembershipPlan | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setIsLoading(true);
      const [memberData, plansData, paymentsData] = await Promise.all([
        api.get('/members/me'),
        api.get('/plans'),
        api.get('/payments/me')
      ]);
      setMember(memberData);
      setPaymentHistory(paymentsData);
      const myPlan = plansData.find((p: MembershipPlan) => p.id === memberData.planId);
      setPlan(myPlan);
    } catch (error) {
      console.error("Error fetching payment data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: 'Invoice Downloaded',
      description: `${invoiceId} has been downloaded.`,
    });
  };

  const handlePayNow = () => {
    toast({
      title: 'Payment Initiated',
      description: 'Please complete the payment at the counter.',
    });
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

  const paymentStatus = member.dueAmount > 0 ? 'pending' : 'paid';
  const nextPaymentDate = new Date(member.expiryDate);
  const daysUntilDue = Math.ceil((nextPaymentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <DashboardLayout requiredRole="member">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground">
            MY <span className="text-gradient-primary">PAYMENTS</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            View your payment history and manage dues.
          </p>
        </div>

        {/* Payment Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/20">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-xl font-bold text-foreground">{plan?.name || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">₹{(plan?.price || 0).toLocaleString()}/month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${paymentStatus === 'paid' ? 'bg-accent/20' : 'bg-warning/20'}`}>
                  {paymentStatus === 'paid'
                    ? <CheckCircle className="h-6 w-6 text-accent" />
                    : <AlertCircle className="h-6 w-6 text-warning" />
                  }
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <p className="text-xl font-bold text-foreground">
                    {paymentStatus === 'paid' ? 'All Clear' : 'Payment Due'}
                  </p>
                  <Badge
                    className={
                      paymentStatus === 'paid'
                        ? 'bg-accent/20 text-accent border-accent/30'
                        : 'bg-warning/20 text-warning border-warning/30'
                    }
                  >
                    {paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${daysUntilDue > 7 ? 'bg-info/20' : 'bg-warning/20'}`}>
                  <Calendar className={`h-6 w-6 ${daysUntilDue > 7 ? 'text-info' : 'text-warning'}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Payment</p>
                  <p className="text-xl font-bold text-foreground">
                    {nextPaymentDate.toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {daysUntilDue > 0 ? `${daysUntilDue} days remaining` : daysUntilDue === 0 ? 'Due Today' : 'Overdue'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pay Now Section (if pending) */}
        {paymentStatus === 'pending' && (
          <Card className="bg-gradient-to-r from-warning/10 to-warning/5 border-warning/30">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-warning/20">
                    <AlertCircle className="h-8 w-8 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Payment Due</h3>
                    <p className="text-muted-foreground">
                      Your membership fee of ₹{member.dueAmount.toLocaleString()} is pending.
                    </p>
                  </div>
                </div>
                <Button variant="hero" className="gap-2" onClick={handlePayNow}>
                  <IndianRupee className="h-4 w-4" />
                  Pay Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Payment History
            </CardTitle>
            <CardDescription>Your past payments and invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentHistory.length > 0 ? (
                paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-muted/30 gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-accent/20">
                        <IndianRupee className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          ₹{payment.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })} • {(payment as any).method || 'Cash'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:ml-auto">
                      <Badge className={cn(
                        "border",
                        payment.status === 'paid' ? 'bg-accent/20 text-accent border-accent/30' : 'bg-warning/20 text-warning border-warning/30'
                      )}>
                        {payment.status.toUpperCase()}
                      </Badge>
                      {(payment as any).invoiceId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleDownloadInvoice((payment as any).invoiceId)}
                        >
                          <Download className="h-4 w-4" />
                          Invoice
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No payment history found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Info */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Accepted Payment Methods</CardTitle>
            <CardDescription>We accept multiple payment options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['UPI', 'Debit Card', 'Credit Card', 'Cash'].map((method) => (
                <div
                  key={method}
                  className="p-4 rounded-lg bg-muted/30 text-center"
                >
                  <CreditCard className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">{method}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MemberPayments;
