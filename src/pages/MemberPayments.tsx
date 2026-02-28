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
  Receipt,
  Loader2,
  Shield,
  Zap,
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
import { openRazorpayCheckout } from '@/lib/razorpay';

const MemberPayments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [member, setMember] = useState<Member | null>(null);
  const [plan, setPlan] = useState<MembershipPlan | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPayingNow, setIsPayingNow] = useState(false);

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

  const handlePayNow = async () => {
    if (!member || member.dueAmount <= 0) return;
    setIsPayingNow(true);

    try {
      // Step 1: Create Razorpay order
      const orderData = await api.post('/razorpay/create-membership-order', {});

      // Step 2: Open Razorpay checkout
      await openRazorpayCheckout({
        keyId: orderData.keyId,
        orderId: orderData.razorpayOrderId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'GymPro Membership',
        description: `Membership Fee — ${plan?.name || 'Membership Plan'}`,
        prefillName: member.name,
        prefillEmail: member.email,
        prefillContact: member.phone,
        onSuccess: async (response) => {
          try {
            // Step 3: Verify payment on backend
            await api.post('/razorpay/verify-membership-payment', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              amount: member.dueAmount,
              planId: member.planId,
            });

            toast({
              title: '🎉 Payment Successful!',
              description: `₹${member.dueAmount.toLocaleString()} paid successfully. Your membership is active!`,
            });

            // Refresh data
            await fetchPaymentData();
          } catch (verifyError: any) {
            toast({
              title: 'Verification Failed',
              description: verifyError.message || 'Payment was received but verification failed. Please contact support.',
              variant: 'destructive',
            });
          } finally {
            setIsPayingNow(false);
          }
        },
        onDismiss: () => {
          setIsPayingNow(false);
          toast({
            title: 'Payment Cancelled',
            description: 'You cancelled the payment. Your dues are still pending.',
          });
        },
      });
    } catch (error: any) {
      setIsPayingNow(false);
      toast({
        title: 'Payment Failed',
        description: error.message || 'Could not initiate payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: 'Invoice Downloaded',
      description: `${invoiceId} has been downloaded.`,
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
            View your payment history and pay dues online instantly.
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
                    {paymentStatus === 'paid' ? 'Paid' : `₹${member.dueAmount.toLocaleString()} Due`}
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
          <Card className="bg-gradient-to-r from-warning/10 to-primary/5 border-warning/30">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-warning/20 mt-1">
                    <AlertCircle className="h-8 w-8 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Payment Due</h3>
                    <p className="text-muted-foreground">
                      Your membership fee of{' '}
                      <span className="text-foreground font-semibold">₹{member.dueAmount.toLocaleString()}</span>{' '}
                      is pending.
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-accent" /> Secured by Razorpay
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-primary" /> Instant confirmation
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="hero"
                  className="gap-2 min-w-[160px] h-12 text-base"
                  onClick={handlePayNow}
                  disabled={isPayingNow}
                >
                  {isPayingNow ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <IndianRupee className="h-4 w-4" />
                      Pay ₹{member.dueAmount.toLocaleString()}
                    </>
                  )}
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
            <div className="space-y-3">
              {paymentHistory.length > 0 ? (
                paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30 gap-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-accent/20">
                        <IndianRupee className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          ₹{payment.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                          {' • '}
                          {(payment as any).method || 'Cash'}
                        </p>
                        {(payment as any).razorpayPaymentId && (
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            Txn: {(payment as any).razorpayPaymentId}
                          </p>
                        )}
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
                <div className="text-center py-12 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No payment history found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Accepted Payment Methods */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Accepted Payment Methods</CardTitle>
            <CardDescription>
              Pay securely online via Razorpay or with cash at the counter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'UPI', sub: 'GPay, PhonePe, Paytm' },
                { label: 'Debit Card', sub: 'Visa, Mastercard, RuPay' },
                { label: 'Credit Card', sub: 'All major cards' },
                { label: 'Cash', sub: 'At the counter' },
              ].map((method) => (
                <div
                  key={method.label}
                  className="p-4 rounded-xl bg-muted/30 text-center border border-border/30 hover:border-primary/30 transition-colors"
                >
                  <CreditCard className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">{method.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{method.sub}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3 text-accent" />
              <span>All online payments are processed securely by <strong>Razorpay</strong> — PCI-DSS compliant.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MemberPayments;
