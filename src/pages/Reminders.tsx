import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  Mail,
  Send,
  AlertCircle,
  Clock,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

const Reminders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [membersNeedingReminder, setMembersNeedingReminder] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/reminders/pending');
      setMembersNeedingReminder(data);
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
      toast({ title: 'Error', description: 'Failed to load reminders', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = membersNeedingReminder.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const toggleAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(m => m.id));
    }
  };

  const sendEmailReminders = async (memberIds?: string[]) => {
    const ids = memberIds || selectedMembers;
    if (ids.length === 0) {
      toast({ title: 'No Members Selected', description: 'Please select at least one member.', variant: 'destructive' });
      return;
    }

    try {
      setIsSending(true);
      await api.post('/reminders/email', { member_ids: ids });
      toast({
        title: 'Reminders Sent Successfully',
        description: `Successfully sent email reminders to ${ids.length} member(s).`
      });
      if (!memberIds) setSelectedMembers([]);
    } catch (error) {
      toast({ title: 'Delivery Failed', description: 'Failed to send one or more email reminders. Please check your SMTP settings.', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (daysUntilExpiry: number, paymentStatus: string) => {
    if (paymentStatus === 'pending') return <Badge className="bg-warning/20 text-warning border-warning/30">Payment Pending</Badge>;
    if (daysUntilExpiry < 0) return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Expired</Badge>;
    if (daysUntilExpiry <= 3) return <Badge className="bg-warning/20 text-warning border-warning/30">Expiring Soon</Badge>;
    return <Badge className="bg-info/20 text-info border-info/30">{daysUntilExpiry} days left</Badge>;
  };

  return (
    <DashboardLayout requiredRole="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              SEND <span className="text-gradient-primary">REMINDERS</span>
            </h1>
            <p className="text-muted-foreground mt-1">Send professional email reminders for renewals and pending dues.</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="hero"
              className="gap-2 w-full sm:w-auto"
              onClick={() => sendEmailReminders()}
              disabled={selectedMembers.length === 0 || isSending}
            >
              <Mail className="h-4 w-4" />
              {isSending ? 'Sending...' : `Send Bulk Email (${selectedMembers.length})`}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-destructive/20">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold text-foreground">{membersNeedingReminder.filter(m => m.daysUntilExpiry < 0).length}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-warning/20">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expiring This Week</p>
                <p className="text-2xl font-bold text-foreground">{membersNeedingReminder.filter(m => m.daysUntilExpiry >= 0 && m.daysUntilExpiry <= 7).length}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Pending</p>
                <p className="text-2xl font-bold text-foreground">{membersNeedingReminder.filter(m => m.paymentStatus === 'pending').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search members by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block rounded-xl border border-border/50 overflow-hidden bg-gradient-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="py-4 px-6 w-12">
                    <Checkbox
                      checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                      onCheckedChange={toggleAll}
                    />
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Member</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Contact Details</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6">
                      <Checkbox checked={selectedMembers.includes(member.id)} onCheckedChange={() => toggleMember(member.id)} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-medium">{member.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">Plan: {member.plan || "No Plan Assigned"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-foreground">{member.email}</p>
                      <p className="text-sm text-muted-foreground">{member.phone}</p>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(member.daysUntilExpiry, member.paymentStatus)}</td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => sendEmailReminders([member.id])}
                      >
                        <Mail className="h-4 w-4" />
                        Send Reminder
                      </Button>
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
              <div className="flex items-start gap-3 mb-4">
                <Checkbox
                  checked={selectedMembers.includes(member.id)}
                  onCheckedChange={() => toggleMember(member.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      <p className="text-xs text-muted-foreground">{member.phone}</p>
                    </div>
                    {getStatusBadge(member.daysUntilExpiry, member.paymentStatus)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Plan: {member.plan || "None"}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-primary border-primary/20 hover:bg-primary/10"
                onClick={() => sendEmailReminders([member.id])}
              >
                <Mail className="h-4 w-4" />
                Send Email Reminder
              </Button>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No members need reminders at this time.</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading members...</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reminders;
